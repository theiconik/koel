"""
Background processing pipeline for a submitted voice response.

Triggered by FastAPI BackgroundTasks immediately after a response row is
created.  Steps:
  1. Mark response as "processing"
  2. Fetch transcript + duration from ElevenLabs
  3. Store raw transcript in DB
  4. Call OpenRouter LLM → extract quote, tags, summary
  5. Update response row with enriched data, set status "done"
  6. Upsert per-survey theme counts
"""

import logging
import asyncio
from db.client import get_client
from services.elevenlabs import ElevenLabsError, fetch_conversation
from services.llm import extract_insights
from services.response_index import index_response
from config.processing import processing

logger = logging.getLogger(__name__)


async def process_response(response_id: str, survey_id: str, conversation_id: str) -> None:
    """
    Run the full enrichment pipeline for a single response.
    Designed to be fire-and-forget — errors are logged, never raised.
    """
    db = get_client()

    # ── 1. mark processing ───────────────────────────────────────────────────
    try:
        db.table("responses").update(
            {"processing_status": "processing"}
        ).eq("id", response_id).execute()
    except Exception as exc:
        logger.error("Failed to mark response %s as processing: %s", response_id, exc)
        return

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
    except ElevenLabsError as exc:
        logger.error("ElevenLabs error for response %s: %s", response_id, exc)
        _mark_failed(db, response_id, str(exc))
        return
    except Exception as exc:
        logger.error("Unexpected error fetching transcript for %s: %s", response_id, exc)
        _mark_failed(db, response_id, "Could not fetch transcript")
        return

    if not transcript.strip():
        logger.warning("Response %s has no transcript after polling", response_id)
        _mark_failed(db, response_id, "Transcript was not available from ElevenLabs yet")
        return

    # ── 4. LLM enrichment ────────────────────────────────────────────────────
    try:
        insights = await extract_insights(transcript)
        quote: str = insights.get("quote", "")
        tags: list[str] = insights.get("tags", [])
        summary: str = insights.get("summary", "")
        sentiment: str = insights.get("sentiment", "neutral")
    except Exception as exc:
        logger.error("LLM error for response %s: %s", response_id, exc)
        quote, tags, summary, sentiment = _fallback_insights(transcript, transcript_segments)
        processing_error = "AI summary generation failed; transcript was preserved"
    else:
        processing_error = None

    # ── 5. persist enriched data ─────────────────────────────────────────────
    try:
        db.table("responses").update(
            {
                "quote": quote,
                "tags": tags,
                "summary": summary,
                "sentiment": sentiment,
                "processing_status": "done",
                "processing_error": processing_error,
            }
        ).eq("id", response_id).execute()
    except Exception as exc:
        logger.error("Failed to update enriched data for %s: %s", response_id, exc)
        _mark_failed(db, response_id, "Could not save processed response")
        return

    # ── 6. upsert theme counts ───────────────────────────────────────────────
    try:
        _upsert_themes(db, survey_id, tags)
    except Exception as exc:
        # Theme upsert failure is non-fatal — response is already "done"
        logger.warning("Theme upsert failed for survey %s: %s", survey_id, exc)

    logger.info("Response %s processed successfully", response_id)

    try:
        await index_response(response_id=response_id, survey_id=survey_id)
    except Exception as exc:
        logger.warning("Response %s processed but could not be indexed: %s", response_id, exc)


async def _fetch_conversation_when_ready(conversation_id: str) -> dict:
    last_result: dict | None = None
    for attempt in range(1, processing.transcript_poll_attempts + 1):
        result = await fetch_conversation(conversation_id)
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
        raise ElevenLabsError("No ElevenLabs response received")
    return last_result


def _fallback_insights(transcript: str, transcript_segments: list[dict]) -> tuple[str, list[str], str, str]:
    quote = next(
        (
            segment["text"]
            for segment in transcript_segments
            if segment.get("who") == "them" and segment.get("text")
        ),
        "",
    )
    if not quote:
        quote = transcript.splitlines()[0].partition(":")[2].strip() if transcript else ""
    summary = "Transcript captured. AI summary generation failed and can be retried later."
    return quote, [], summary, "neutral"


def _mark_failed(db, response_id: str, message: str) -> None:
    try:
        db.table("responses").update(
            {"processing_status": "failed", "processing_error": message}
        ).eq("id", response_id).execute()
    except Exception as exc:
        logger.error("Could not mark response %s as failed: %s", response_id, exc)


def _upsert_themes(db, survey_id: str, tags: list[str]) -> None:
    """
    For each tag, increment the count if the theme exists, otherwise insert.
    Supabase/Postgres upsert: INSERT ... ON CONFLICT DO UPDATE.
    """
    if not tags:
        return

    # Fetch existing themes for the survey to assign stable colours
    existing_resp = (
        db.table("themes")
        .select("name, count")
        .eq("survey_id", survey_id)
        .execute()
    )
    existing = {row["name"]: row["count"] for row in (existing_resp.data or [])}
    colour_index = len(existing)

    for tag in tags:
        tag = tag.strip().lower()
        if not tag:
            continue
        if tag in existing:
            db.table("themes").update(
                {"count": existing[tag] + 1}
            ).eq("survey_id", survey_id).eq("name", tag).execute()
        else:
            colour = processing.theme_colours[colour_index % len(processing.theme_colours)]
            db.table("themes").insert(
                {
                    "survey_id": survey_id,
                    "name": tag,
                    "count": 1,
                    "color": colour,
                }
            ).execute()
            colour_index += 1
