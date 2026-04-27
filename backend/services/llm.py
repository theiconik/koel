"""
LLM service — extract a headline quote and theme tags from a voice
conversation transcript.

OpenRouter is the primary provider. Gemini is used as a secondary provider via
Google's OpenAI-compatible endpoint if the primary call fails after retries.
Prompt strings live in config/prompts.py; LLM parameters live in
config/processing.py.
"""

import json
import logging

from openai import AsyncOpenAI
from pydantic import BaseModel, Field

from config.processing import processing
from config.prompts import EXTRACT_INSIGHTS_SYSTEM, EXTRACT_INSIGHTS_USER
from config.settings import settings

logger = logging.getLogger(__name__)


class LLMResponseError(RuntimeError):
    pass


REQUIRED_TEXT_FIELDS = ("quote", "summary")


class InsightPayload(BaseModel):
    quote: str = ""
    tags: list[str] = Field(default_factory=list)
    summary: str = ""
    sentiment: str = "neutral"


def _openrouter_client() -> AsyncOpenAI:
    return AsyncOpenAI(
        api_key=settings.openrouter_api_key,
        base_url="https://openrouter.ai/api/v1",
        max_retries=processing.llm_max_retries,
    )


def _gemini_client() -> AsyncOpenAI:
    return AsyncOpenAI(
        api_key=settings.gemini_api_key,
        base_url=settings.gemini_base_url,
        max_retries=processing.llm_max_retries,
    )


async def extract_insights(transcript: str) -> dict:
    """
    Returns a dict with keys: quote (str), tags (list[str]), summary (str),
    sentiment (str).
    Falls back from OpenRouter to Gemini if the primary provider errors after
    retries. Raises only if every configured provider fails.
    """
    char_count = len(transcript)
    logger.info(
        "Extracting insights via OpenRouter model %s (%d chars of transcript)",
        settings.openrouter_model,
        char_count,
    )

    try:
        return await _extract_with_provider(
            provider="OpenRouter",
            client=_openrouter_client(),
            model=settings.openrouter_model,
            transcript=transcript,
        )
    except Exception as openrouter_exc:
        logger.warning(
            "OpenRouter insight extraction failed after %d retries: %s",
            processing.llm_max_retries,
            openrouter_exc,
        )

    if not settings.gemini_api_key:
        raise LLMResponseError("OpenRouter failed and GEMINI_API_KEY is not configured")

    logger.info(
        "Falling back to Gemini model %s for insight extraction",
        settings.gemini_model,
    )
    return await _extract_with_gemini(
        client=_gemini_client(),
        model=settings.gemini_model,
        transcript=transcript,
    )


async def _extract_with_provider(
    *,
    provider: str,
    client: AsyncOpenAI,
    model: str,
    transcript: str,
) -> dict:
    response = await client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": EXTRACT_INSIGHTS_SYSTEM},
            {"role": "user", "content": EXTRACT_INSIGHTS_USER.format(transcript=transcript)},
        ],
        temperature=processing.llm_temperature,
        max_tokens=processing.llm_max_tokens,
        response_format={"type": "json_object"},
    )

    raw = _message_content(response)
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        raise LLMResponseError(
            f"{provider} returned malformed JSON (model={model}, raw={raw[:200]})"
        )

    return _normalise_insights(provider=provider, model=model, data=data, raw=raw)


async def _extract_with_gemini(
    *,
    client: AsyncOpenAI,
    model: str,
    transcript: str,
) -> dict:
    request_kwargs = {
        "model": model,
        "messages": [
            {"role": "system", "content": EXTRACT_INSIGHTS_SYSTEM},
            {"role": "user", "content": EXTRACT_INSIGHTS_USER.format(transcript=transcript)},
        ],
        "temperature": processing.llm_temperature,
        "max_tokens": processing.llm_max_tokens,
        "response_format": InsightPayload,
    }
    if model.startswith("gemini-2.5"):
        request_kwargs["reasoning_effort"] = "none"

    response = await client.beta.chat.completions.parse(**request_kwargs)
    message = response.choices[0].message if response.choices else None
    raw = getattr(message, "content", None) or "{}"
    parsed = getattr(message, "parsed", None)
    if parsed is None:
        raise LLMResponseError(
            f"Gemini returned no parsed payload (model={model}, raw={raw[:200]})"
        )

    return _normalise_insights(
        provider="Gemini",
        model=model,
        data=parsed.model_dump(),
        raw=raw,
    )


def _message_content(response: object) -> str:
    choices = getattr(response, "choices", None) or []
    choice = choices[0] if choices else None
    message = getattr(choice, "message", None)
    return getattr(message, "content", None) or "{}"


def _normalise_insights(
    *,
    provider: str,
    model: str,
    data: object,
    raw: str,
) -> dict:
    if not isinstance(data, dict):
        raise LLMResponseError(
            f"{provider} returned non-object JSON (model={model}, raw={raw[:200]})"
        )

    quote: str = str(data.get("quote") or "").strip()
    tags = data.get("tags") if isinstance(data.get("tags"), list) else []
    tags = [str(tag).strip() for tag in tags if str(tag).strip()]
    summary: str = str(data.get("summary") or "").strip()
    sentiment: str = data.get("sentiment") or "neutral"
    if sentiment not in {"delighted", "neutral", "frustrated"}:
        sentiment = "neutral"

    missing_fields = [
        field
        for field in REQUIRED_TEXT_FIELDS
        if not str(data.get(field) or "").strip()
    ]
    if missing_fields:
        raise LLMResponseError(
            f"{provider} returned empty required field(s) "
            f"{', '.join(missing_fields)} (model={model}, raw={raw[:200]})"
        )

    logger.debug(
        "Insights extracted via %s — quote=%d chars, tags=%s",
        provider,
        len(quote), tags,
    )

    return {"quote": quote, "tags": tags, "summary": summary, "sentiment": sentiment}
