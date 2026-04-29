"""
Survey-scoped insights chat orchestration.

Routing is deterministic first. If the query is too ambiguous for rules, the
LLM classifier chooses the tool path, but structured counts still come from the
database and qualitative answers still come from retrieved chunks.
"""

from collections import Counter
from dataclasses import dataclass
import logging
import re

from db.client import get_client
from services.embeddings import EmbeddingError
from services.llm import LLMResponseError, answer_with_context, classify_insights_question
from services.response_index import search_response_chunks

logger = logging.getLogger(__name__)

NO_RESPONSES = "No responses for this survey yet."
NOT_INDEXED = "The responses have not been indexed yet. Please try again after some time."

RouteName = str


@dataclass(frozen=True)
class QueryRoute:
    route: RouteName
    confidence: float
    sentiment: str | None = None


COUNT_TERMS = {
    "how many",
    "count",
    "number of",
    "percentage",
    "percent",
    "share",
    "ratio",
    "breakdown",
    "total",
}
TAG_TERMS = {"top tags", "most common", "common tags", "themes", "top themes"}
WHY_TERMS = {"why", "reason", "reasons", "explain", "what did", "what are", "summarize"}
SENTIMENT_ALIASES = {
    "delighted": {"delighted", "positive", "positively", "happy", "liked", "loved", "satisfied"},
    "frustrated": {"frustrated", "negative", "negatively", "unhappy", "complained", "complaints"},
    "neutral": {"neutral", "mixed", "okay", "indifferent"},
}


def _contains_any(text: str, terms: set[str]) -> bool:
    return any(term in text for term in terms)


def _sentiment_from_query(text: str) -> str | None:
    padded = f" {text} "
    for sentiment, aliases in SENTIMENT_ALIASES.items():
        for alias in aliases:
            if re.search(rf"\b{re.escape(alias)}\b", padded):
                return sentiment
    return None


def _rule_route(question: str) -> QueryRoute:
    text = question.strip().lower()
    if not text or len(text.split()) <= 2:
        return QueryRoute(route="rag", confidence=0.35)

    has_count = _contains_any(text, COUNT_TERMS)
    has_tags = _contains_any(text, TAG_TERMS)
    sentiment = _sentiment_from_query(text)
    wants_explanation = _contains_any(text, WHY_TERMS)

    if (has_count or has_tags or sentiment) and wants_explanation:
        return QueryRoute(route="hybrid", confidence=0.9, sentiment=sentiment)
    if has_count or has_tags or (sentiment and re.search(r"\b(how|count|many|percent|share)\b", text)):
        return QueryRoute(route="analytics", confidence=0.9, sentiment=sentiment)
    if sentiment and not wants_explanation:
        return QueryRoute(route="rag", confidence=0.65, sentiment=sentiment)
    if re.search(r"\b(why|what|summarize|summary|tell me|find|show|objections|pain|feedback)\b", text):
        return QueryRoute(route="rag", confidence=0.8)

    return QueryRoute(route="rag", confidence=0.45)


async def _resolve_route(question: str) -> QueryRoute:
    route = _rule_route(question)
    if route.confidence >= 0.6:
        return route

    try:
        classified = await classify_insights_question(question)
        return QueryRoute(
            route=classified["route"],
            confidence=0.7,
            sentiment=classified.get("sentiment") or route.sentiment,
        )
    except Exception as exc:
        logger.warning("Insights classifier unavailable, defaulting to RAG: %s", exc)
        return QueryRoute(route="rag", confidence=0.5, sentiment=route.sentiment)


def _done_responses(survey_id: str) -> list[dict]:
    resp = (
        get_client()
        .table("responses")
        .select("id, sentiment, tags, processing_status")
        .eq("survey_id", survey_id)
        .eq("processing_status", "done")
        .execute()
    )
    return resp.data or []


def _response_count(survey_id: str) -> int:
    resp = (
        get_client()
        .table("responses")
        .select("id", count="exact")
        .eq("survey_id", survey_id)
        .execute()
    )
    return resp.count or 0


def _indexed_count(survey_id: str) -> int:
    try:
        resp = (
            get_client()
            .table("response_chunks")
            .select("id", count="exact")
            .eq("survey_id", survey_id)
            .execute()
        )
        return resp.count or 0
    except Exception as exc:
        logger.warning("Could not count indexed chunks for survey %s: %s", survey_id, exc)
        return 0


def _survey_context(survey_id: str) -> dict:
    db = get_client()
    survey_resp = (
        db.table("surveys")
        .select("title, description")
        .eq("id", survey_id)
        .limit(1)
        .execute()
    )
    survey = survey_resp.data[0] if survey_resp.data else {}
    questions_resp = (
        db.table("questions")
        .select("text")
        .eq("survey_id", survey_id)
        .eq("active", True)
        .order("order")
        .execute()
    )
    questions = [row["text"] for row in questions_resp.data or [] if row.get("text")]
    return {
        "title": survey.get("title") or "Untitled survey",
        "description": survey.get("description") or "",
        "questions": questions,
    }


def _empty_answer(survey_id: str) -> str | None:
    if _response_count(survey_id) == 0:
        return NO_RESPONSES
    if _indexed_count(survey_id) == 0:
        return NOT_INDEXED
    return None


def _percent(part: int, whole: int) -> str:
    if whole <= 0:
        return "0%"
    return f"{round((part / whole) * 100)}%"


def _analytics_answer(survey_id: str, question: str, sentiment: str | None) -> str:
    responses = _done_responses(survey_id)
    total_responses = _response_count(survey_id)
    if total_responses == 0:
        return NO_RESPONSES
    if not responses:
        return NOT_INDEXED

    text = question.lower()
    total_done = len(responses)
    sentiment_counts = Counter(r.get("sentiment") or "neutral" for r in responses)

    if _contains_any(text, TAG_TERMS):
        tags: Counter[str] = Counter()
        for response in responses:
            for tag in response.get("tags") or []:
                if str(tag).strip():
                    tags[str(tag).strip().lower()] += 1
        if not tags:
            return "No tags have been extracted for this survey yet."
        top_tags = ", ".join(f"{tag} ({count})" for tag, count in tags.most_common(5))
        return f"The most common themes are {top_tags}, across {total_done} processed responses."

    if sentiment:
        count = sentiment_counts[sentiment]
        label = {
            "delighted": "positive",
            "neutral": "neutral",
            "frustrated": "negative",
        }[sentiment]
        return f"{count} of {total_done} processed responses were {label} ({_percent(count, total_done)})."

    if "breakdown" in text or "sentiment" in text:
        delighted = sentiment_counts["delighted"]
        neutral = sentiment_counts["neutral"]
        frustrated = sentiment_counts["frustrated"]
        return (
            f"Out of {total_done} processed responses: {delighted} positive, "
            f"{neutral} neutral, and {frustrated} negative."
        )

    return f"This survey has {total_responses} total responses, with {total_done} processed responses available for analysis."


def _format_context(chunks: list[dict]) -> str:
    lines = []
    for idx, chunk in enumerate(chunks, start=1):
        metadata = chunk.get("metadata") or {}
        sentiment = metadata.get("sentiment") or "neutral"
        tags = metadata.get("tags") or []
        chunk_type = metadata.get("chunk_type") or "response_chunk"
        question_text = metadata.get("question_text")
        tag_text = f" Tags: {', '.join(str(tag) for tag in tags)}." if tags else ""
        question_label = f"\nMatched question: {question_text}" if question_text else ""
        lines.append(
            f"Chunk {idx} ({chunk_type}; sentiment: {sentiment}.{tag_text})"
            f"{question_label}\n{chunk['content']}"
        )
    return "\n\n".join(lines)


def _format_survey_context(context: dict) -> str:
    questions = context.get("questions") or []
    question_text = "\n".join(f"- {question}" for question in questions)
    description = context.get("description")
    description_text = f"\nSurvey description: {description}" if description else ""
    questions_text = f"\nSurvey questions:\n{question_text}" if question_text else ""
    return f"Survey title: {context['title']}{description_text}{questions_text}"


async def _rag_answer(survey_id: str, question: str, sentiment: str | None = None) -> str:
    empty_answer = _empty_answer(survey_id)
    if empty_answer:
        return empty_answer

    survey_context = _survey_context(survey_id)
    search_query = f"{question}\n\n{_format_survey_context(survey_context)}"
    try:
        chunks = await search_response_chunks(
            survey_id=survey_id,
            query=search_query,
            sentiment=sentiment,
        )
    except EmbeddingError as exc:
        logger.warning("Could not embed insights query for survey %s: %s", survey_id, exc)
        return NOT_INDEXED
    except Exception as exc:
        logger.warning("Could not search indexed chunks for survey %s: %s", survey_id, exc)
        return NOT_INDEXED

    if not chunks:
        return NOT_INDEXED

    context = f"{_format_survey_context(survey_context)}\n\n{_format_context(chunks)}"
    try:
        return await answer_with_context(question, context)
    except LLMResponseError as exc:
        logger.warning("Could not answer insights query for survey %s: %s", survey_id, exc)
        return "Sorry, we are facing some issues. Please try again later."


async def answer_survey_question(survey_id: str, question: str) -> dict:
    route = await _resolve_route(question)

    if route.route == "analytics":
        return {
            "answer": _analytics_answer(survey_id, question, route.sentiment),
            "route": "analytics",
        }

    if route.route == "hybrid":
        analytics = _analytics_answer(survey_id, question, route.sentiment)
        if analytics in {NO_RESPONSES, NOT_INDEXED}:
            return {"answer": analytics, "route": "hybrid"}

        qualitative = await _rag_answer(survey_id, question, route.sentiment)
        if qualitative in {NO_RESPONSES, NOT_INDEXED}:
            return {"answer": analytics, "route": "hybrid"}
        return {"answer": f"{analytics}\n\n{qualitative}", "route": "hybrid"}

    return {"answer": await _rag_answer(survey_id, question, route.sentiment), "route": "rag"}
