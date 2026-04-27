"""
OpenRouter LLM service — extract a headline quote and theme tags from a
voice conversation transcript.

Uses the openai SDK pointed at OpenRouter's OpenAI-compatible endpoint.
Prompt strings live in config/prompts.py; LLM parameters live in
config/processing.py.
"""

import json
import logging

from openai import AsyncOpenAI

from config.processing import processing
from config.prompts import EXTRACT_INSIGHTS_SYSTEM, EXTRACT_INSIGHTS_USER
from config.settings import settings

logger = logging.getLogger(__name__)


def _client() -> AsyncOpenAI:
    return AsyncOpenAI(
        api_key=settings.openrouter_api_key,
        base_url="https://openrouter.ai/api/v1",
    )


async def extract_insights(transcript: str) -> dict:
    """
    Returns a dict with keys: quote (str), tags (list[str]), summary (str),
    sentiment (str).
    Falls back to safe defaults if the LLM returns malformed output.
    """
    model = settings.openrouter_model
    char_count = len(transcript)
    logger.info(
        "Extracting insights via %s (%d chars of transcript)", model, char_count
    )

    response = await _client().chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": EXTRACT_INSIGHTS_SYSTEM},
            {"role": "user", "content": EXTRACT_INSIGHTS_USER.format(transcript=transcript)},
        ],
        temperature=processing.llm_temperature,
        max_tokens=processing.llm_max_tokens,
        response_format={"type": "json_object"},
    )

    raw = response.choices[0].message.content or "{}"
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        logger.warning(
            "LLM returned malformed JSON (model=%s) — using empty defaults. raw=%s",
            model, raw[:200],
        )
        data = {}

    quote: str = data.get("quote") or ""
    tags: list[str] = data.get("tags") or []
    summary: str = data.get("summary") or ""
    sentiment: str = data.get("sentiment") or "neutral"
    if sentiment not in {"delighted", "neutral", "frustrated"}:
        sentiment = "neutral"

    logger.debug(
        "Insights extracted — quote=%d chars, tags=%s",
        len(quote), tags,
    )

    return {"quote": quote, "tags": tags, "summary": summary, "sentiment": sentiment}
