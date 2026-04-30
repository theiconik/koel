"""Index processed survey responses into transcript-grounded retrieval chunks."""

import logging

from config.processing import processing
from db.client import get_client
from services.embeddings import embed_text

logger = logging.getLogger(__name__)


def _normalise_tags(value: object) -> list[str]:
    return [str(tag).strip() for tag in value or [] if str(tag).strip()]


def _summary_chunk(response: dict) -> dict | None:
    summary = str(response.get("summary") or "").strip()
    quote = str(response.get("quote") or "").strip()
    tags = _normalise_tags(response.get("tags"))
    if not summary and not quote and not tags:
        return None

    parts = []
    if summary:
        parts.append(f"Response summary: {summary}")
    if quote:
        parts.append(f"Representative quote: {quote}")
    if tags:
        parts.append(f"Themes: {', '.join(tags)}")
    return {
        "content": "\n".join(parts),
        "metadata": {
            "chunk_type": "response_summary",
            "question_text": None,
            "turn_index": None,
        },
    }


def _qa_chunks(response: dict) -> list[dict]:
    transcript_json = response.get("transcript_json") or []
    if not isinstance(transcript_json, list):
        return []

    chunks: list[dict] = []
    pending_question: str | None = None
    pending_question_index: int | None = None

    for idx, segment in enumerate(transcript_json):
        if not isinstance(segment, dict):
            continue
        text = str(segment.get("text") or "").strip()
        if not text:
            continue

        who = segment.get("who")
        if who == "koel":
            pending_question = text
            pending_question_index = idx
            continue

        if who != "them":
            continue

        if pending_question:
            content = f"Question: {pending_question}\nRespondent answer: {text}"
            question_text = pending_question
        else:
            content = f"Respondent answer: {text}"
            question_text = None

        chunks.append(
            {
                "content": content,
                "metadata": {
                    "chunk_type": "qa_pair",
                    "question_text": question_text,
                    "question_turn_index": pending_question_index,
                    "answer_turn_index": idx,
                },
            }
        )
        pending_question = None
        pending_question_index = None

    return chunks


def _fallback_transcript_chunks(response: dict) -> list[dict]:
    transcript = str(response.get("transcript") or "").strip()
    if not transcript:
        return []
    return [
        {
            "content": f"Transcript excerpt:\n{transcript}",
            "metadata": {
                "chunk_type": "transcript_fallback",
                "question_text": None,
                "turn_index": None,
            },
        }
    ]


def _build_chunks(response: dict) -> list[dict]:
    chunks = _qa_chunks(response)
    summary = _summary_chunk(response)
    if summary:
        chunks.append(summary)
    if chunks:
        return chunks
    return _fallback_transcript_chunks(response)


async def index_response(response_id: str, survey_id: str) -> int:
    """
    Rebuild retrieval chunks for one processed response.

    Returns the number of chunks written. Raises on embedding/storage errors so
    callers can log failures without silently assuming the response is indexed.
    """
    db = get_client()
    resp = (
        db.table("responses")
        .select("id, survey_id, transcript, transcript_json, quote, summary, sentiment, tags")
        .eq("id", response_id)
        .eq("survey_id", survey_id)
        .limit(1)
        .execute()
    )
    response = resp.data[0] if resp.data else None
    if not response:
        logger.warning("Cannot index missing response %s for survey %s", response_id, survey_id)
        return 0

    chunks = _build_chunks(response)
    if not chunks:
        logger.info("Response %s has no indexable text", response_id)
        return 0

    tags = _normalise_tags(response.get("tags"))
    rows = []
    for idx, chunk in enumerate(chunks):
        metadata = {
            "sentiment": response.get("sentiment") or "neutral",
            "tags": tags,
            **chunk["metadata"],
        }
        rows.append(
            {
                "survey_id": survey_id,
                "response_id": response_id,
                "chunk_index": idx,
                "content": chunk["content"],
                "metadata": metadata,
                "embedding": await embed_text(chunk["content"]),
            }
        )

    db.rpc(
        "replace_response_chunks",
        {
            "p_response_id": response_id,
            "p_survey_id": survey_id,
            "p_chunks": rows,
        },
    ).execute()
    logger.info("Indexed response %s into %d chunk(s)", response_id, len(rows))
    return len(rows)


async def search_response_chunks(
    *,
    survey_id: str,
    query: str,
    sentiment: str | None = None,
    match_count: int | None = None,
    min_similarity: float | None = None,
) -> list[dict]:
    embedding = await embed_text(query)
    resp = (
        get_client()
        .rpc(
            "match_response_chunks",
            {
                "p_survey_id": survey_id,
                "p_query_embedding": embedding,
                "p_match_count": match_count or processing.rag_match_count,
                "p_min_similarity": min_similarity or processing.rag_min_similarity,
                "p_sentiment": sentiment,
            },
        )
        .execute()
    )
    return resp.data or []
