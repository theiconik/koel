"""
Processing pipeline for a submitted voice response.

Triggered by the durable response-processing worker after a response row and
queue job are created. Steps:
  1. Mark response as "processing"
  2. Fetch transcript + duration from ElevenLabs
  3. Store raw transcript in DB
  4. Call OpenRouter LLM → extract quote, tags, summary
  5. Update response row with enriched data
  6. Rebuild retrieval index
  7. Set status "done"
  8. Upsert per-survey theme counts
"""

import asyncio
import logging
from dataclasses import dataclass
from typing import Literal

from config.log_context import bind_log_context, reset_log_context
from config.processing import processing
from config.tracing import record_exception, set_current_span_attributes
from db.client import get_client
from services.elevenlabs import ElevenLabsError, fetch_conversation
from services.llm import extract_insights
from services.response_index import index_response

logger = logging.getLogger(__name__)

ProcessingStatus = Literal["done", "retry", "failed"]

PROCESSING_DONE: ProcessingStatus = "done"
PROCESSING_RETRY: ProcessingStatus = "retry"
PROCESSING_FAILED: ProcessingStatus = "failed"


@dataclass(frozen=True)
class ProcessingResult:
    status: ProcessingStatus
    error: str | None = None


async def process_response(
    response_id: str,
    survey_id: str,
    conversation_id: str | None,
) -> ProcessingResult:
    """
    Run the full enrichment pipeline for a single response.
    Errors are logged and persisted on the response row. The returned status is
    used by the queue worker to finish the durable job.
    """
    context = bind_log_context(response_id=response_id, survey_id=survey_id)
    set_current_span_attributes(
        {
            "response.id": response_id,
            "survey.id": survey_id,
            "elevenlabs.conversation_id": conversation_id,
        }
    )
    try:
        return await _process_response(response_id, survey_id, conversation_id)
    finally:
        reset_log_context(context)


async def _process_response(
    response_id: str,
    survey_id: str,
    conversation_id: str | None,
) -> ProcessingResult:
    db = get_client()

    if not (conversation_id or "").strip():
        message = "Response is missing an ElevenLabs conversation id"
        logger.warning("Response %s cannot be processed: missing conversation id", response_id)
        _mark_failed(db, response_id, message)
        return ProcessingResult(PROCESSING_FAILED, message)

    conversation_id = conversation_id.strip()

    # ── 1. mark processing ───────────────────────────────────────────────────
    try:
        db.table("responses").update(
            {"processing_status": "processing", "processing_error": None}
        ).eq("id", response_id).execute()
    except Exception as exc:
        record_exception(exc)
        logger.exception("Failed to mark response as processing")
        return ProcessingResult(PROCESSING_RETRY, "Could not start response processing")

    # ── 2 & 3. fetch transcript from ElevenLabs ──────────────────────────────
    try:
        el_result = await _fetch_conversation_when_ready(conversation_id)
        transcript = el_result["transcript_text"]
        transcript_segments = el_result["transcript_segments"]
        duration_seconds = el_result["duration_seconds"]

        db.table("responses").update(
            {
                "transcript": transcript,
                "transcript_json": transcript_segments,
                "duration_seconds": duration_seconds,
                "processing_error": None,
            }
        ).eq("id", response_id).execute()
    except RecoverableProcessingError as exc:
        logger.warning("Recoverable transcript fetch failure: %s", exc)
        return ProcessingResult(PROCESSING_RETRY, str(exc))
    except ElevenLabsError as exc:
        logger.error("Terminal ElevenLabs error for response %s: %s", response_id, exc)
        message = "Could not fetch transcript from ElevenLabs"
        _mark_failed(db, response_id, message)
        return ProcessingResult(PROCESSING_FAILED, message)
    except Exception as exc:
        record_exception(exc)
        logger.exception("Unexpected error fetching or saving transcript")
        return ProcessingResult(PROCESSING_RETRY, "Could not fetch or save transcript")

    if not transcript.strip():
        logger.warning("Response %s has no transcript after polling", response_id)
        message = "ElevenLabs returned an empty transcript"
        _mark_failed(db, response_id, message)
        return ProcessingResult(PROCESSING_FAILED, message)

    # ── 4. LLM enrichment ────────────────────────────────────────────────────
    try:
        insights = await extract_insights(transcript)
        quote: str = insights.get("quote", "")
        tags: list[str] = insights.get("tags", [])
        summary: str = insights.get("summary", "")
        sentiment: str = insights.get("sentiment", "neutral")
    except Exception as exc:
        record_exception(exc)
        logger.exception("LLM error while enriching response")
        return ProcessingResult(
            PROCESSING_RETRY,
            "AI provider was temporarily unavailable",
        )

    # ── 5. persist enriched data ─────────────────────────────────────────────
    try:
        db.table("responses").update(
            {
                "quote": quote,
                "tags": tags,
                "summary": summary,
                "sentiment": sentiment,
                "processing_status": "processing",
                "processing_error": None,
            }
        ).eq("id", response_id).execute()
    except Exception as exc:
        record_exception(exc)
        logger.exception("Failed to update enriched response data")
        return ProcessingResult(PROCESSING_RETRY, "Could not save processed response")

    # ── 6. rebuild retrieval index before exposing the response as done ──────
    try:
        await index_response(response_id=response_id, survey_id=survey_id)
    except Exception as exc:
        record_exception(exc)
        logger.warning("Response %s could not be indexed: %s", response_id, exc)
        return ProcessingResult(PROCESSING_RETRY, "Could not index processed response")

    # ── 7. mark done ─────────────────────────────────────────────────────────
    try:
        db.table("responses").update(
            {
                "processing_status": "done",
                "processing_error": None,
            }
        ).eq("id", response_id).execute()
    except Exception as exc:
        record_exception(exc)
        logger.exception("Failed to mark response as done")
        return ProcessingResult(PROCESSING_RETRY, "Could not finalize processed response")

    # ── 8. upsert theme counts ───────────────────────────────────────────────
    try:
        _upsert_themes(db, survey_id, tags)
    except Exception as exc:
        # Theme upsert failure is non-fatal — response is already "done"
        record_exception(exc)
        logger.warning("Theme upsert failed for survey %s: %s", survey_id, exc)

    logger.info("Response %s processed successfully", response_id)
    return ProcessingResult(PROCESSING_DONE)


async def _fetch_conversation_when_ready(conversation_id: str) -> dict:
    last_result: dict | None = None
    for attempt in range(1, processing.transcript_poll_attempts + 1):
        try:
            result = await fetch_conversation(conversation_id)
        except ElevenLabsError as exc:
            if _is_recoverable_elevenlabs_error(exc):
                raise RecoverableProcessingError(
                    "ElevenLabs transcript fetch failed temporarily"
                ) from exc
            raise
        except Exception as exc:
            raise RecoverableProcessingError(
                "ElevenLabs transcript fetch failed temporarily"
            ) from exc

        last_result = result
        has_transcript = bool(result.get("transcript_segments"))
        status = result.get("status")
        if has_transcript or status == "done":
            return result
        if status == "failed":
            raise ElevenLabsError("ElevenLabs conversation processing failed")
        logger.info(
            "Conversation %s transcript not ready yet (status=%s, attempt=%d/%d)",
            conversation_id,
            status,
            attempt,
            processing.transcript_poll_attempts,
        )
        await asyncio.sleep(processing.transcript_poll_delay_seconds)

    if last_result is None:
        raise RecoverableProcessingError("No ElevenLabs response received")
    raise RecoverableProcessingError("Transcript was not ready from ElevenLabs")


class RecoverableProcessingError(RuntimeError):
    pass


def _is_recoverable_elevenlabs_error(exc: ElevenLabsError) -> bool:
    status_code = getattr(exc, "status_code", None)
    if status_code is not None:
        return status_code == 429 or 500 <= status_code <= 599

    message = str(exc)
    return any(f" {status}" in message for status in (429, 500, 502, 503, 504))


def _mark_failed(db, response_id: str, message: str) -> None:
    try:
        db.table("responses").update(
            {"processing_status": "failed", "processing_error": message}
        ).eq("id", response_id).execute()
    except Exception as exc:
        record_exception(exc)
        logger.exception("Could not mark response as failed")


def _upsert_themes(db, survey_id: str, tags: list[str]) -> None:
    """
    Increment per-survey theme counts atomically in Postgres.
    """
    if not tags:
        return

    db.rpc(
        "increment_survey_themes",
        {
            "p_survey_id": survey_id,
            "p_tags": tags,
        },
    ).execute()
