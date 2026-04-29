"""Embedding helpers for survey RAG."""

import logging

import httpx

from config.processing import processing
from config.settings import settings

logger = logging.getLogger(__name__)


class EmbeddingError(RuntimeError):
    pass


def _model_path(model: str) -> str:
    return model if model.startswith("models/") else f"models/{model}"


async def _embed_with_model(client: httpx.AsyncClient, model: str, text: str) -> httpx.Response:
    model_path = _model_path(model)
    url = f"{settings.gemini_native_base_url.rstrip('/')}/{model_path}:embedContent"
    payload = {
        "model": model_path,
        "content": {"parts": [{"text": text}]},
        "outputDimensionality": processing.embedding_dimensions,
    }
    return await client.post(
        url,
        params={"key": settings.gemini_api_key},
        json=payload,
    )


async def embed_text(text: str) -> list[float]:
    value = text.strip()
    if not value:
        raise EmbeddingError("Cannot embed empty text")
    if not settings.gemini_api_key:
        raise EmbeddingError("GEMINI_API_KEY is not configured")

    async with httpx.AsyncClient(timeout=30) as client:
        response = await _embed_with_model(client, settings.gemini_embedding_model, value)

    if response.status_code >= 400:
        raise EmbeddingError(
            f"Gemini embedding request failed ({response.status_code}): {response.text[:200]}"
        )

    data = response.json()
    embedding = (data.get("embedding") or {}).get("values")
    if not embedding:
        raise EmbeddingError("Gemini embedding response was empty")

    logger.debug("Created embedding with %d dimensions", len(embedding))
    return list(embedding)
