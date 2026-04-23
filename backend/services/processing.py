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
from db.client import get_client
from services.elevenlabs import ElevenLabsError, fetch_conversation
from services.llm import extract_insights
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
        el_result = await fetch_conversation(conversation_id)
        transcript = el_result["transcript_text"]
        duration_seconds = el_result["duration_seconds"]

        db.table("responses").update(
            {"transcript": transcript, "duration_seconds": duration_seconds}
        ).eq("id", response_id).execute()
    except ElevenLabsError as exc:
        logger.error("ElevenLabs error for response %s: %s", response_id, exc)
        _mark_failed(db, response_id)
        return
    except Exception as exc:
        logger.error("Unexpected error fetching transcript for %s: %s", response_id, exc)
        _mark_failed(db, response_id)
        return

    # ── 4. LLM enrichment ────────────────────────────────────────────────────
    try:
        insights = await extract_insights(transcript)
        quote: str = insights.get("quote", "")
        tags: list[str] = insights.get("tags", [])
    except Exception as exc:
        logger.error("LLM error for response %s: %s", response_id, exc)
        _mark_failed(db, response_id)
        return

    # ── 5. persist enriched data ─────────────────────────────────────────────
    try:
        db.table("responses").update(
            {
                "quote": quote,
                "tags": tags,
                "processing_status": "done",
            }
        ).eq("id", response_id).execute()
    except Exception as exc:
        logger.error("Failed to update enriched data for %s: %s", response_id, exc)
        _mark_failed(db, response_id)
        return

    # ── 6. upsert theme counts ───────────────────────────────────────────────
    try:
        _upsert_themes(db, survey_id, tags)
    except Exception as exc:
        # Theme upsert failure is non-fatal — response is already "done"
        logger.warning("Theme upsert failed for survey %s: %s", survey_id, exc)

    logger.info("Response %s processed successfully", response_id)


def _mark_failed(db, response_id: str) -> None:
    try:
        db.table("responses").update(
            {"processing_status": "failed"}
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
