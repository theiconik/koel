"""
ElevenLabs Conversational AI — fetch transcript and metadata for a completed
conversation.

ElevenLabs endpoint:
  GET https://api.elevenlabs.io/v1/convai/conversations/{conversation_id}

Response shape (relevant fields):
  {
    "conversation_id": "...",
    "status": "done",
    "transcript": [
      {"role": "agent" | "user", "message": "...", "time_in_call_secs": 0}
    ],
    "metadata": {
      "call_duration_secs": 185
    }
  }
"""

import logging

import httpx

from config.processing import processing
from config.settings import settings

logger = logging.getLogger(__name__)

_BASE = "https://api.elevenlabs.io/v1"


class ElevenLabsError(RuntimeError):
    pass


async def create_signed_conversation_url() -> str:
    """Create a short-lived signed URL for browser-side Conversations SDK use."""
    if not settings.elevenlabs_agent_id:
        raise ElevenLabsError("ELEVENLABS_AGENT_ID is not configured")

    params: dict[str, str] = {"agent_id": settings.elevenlabs_agent_id}
    if settings.elevenlabs_branch_id:
        params["branch_id"] = settings.elevenlabs_branch_id
    if settings.elevenlabs_environment:
        params["environment"] = settings.elevenlabs_environment

    url = f"{_BASE}/convai/conversation/get-signed-url"
    async with httpx.AsyncClient(timeout=processing.elevenlabs_timeout_seconds) as client:
        resp = await client.get(
            url,
            params=params,
            headers={"xi-api-key": settings.elevenlabs_api_key},
        )

    if not resp.is_success:
        logger.error(
            "ElevenLabs signed URL error: status=%d body=%s",
            resp.status_code,
            resp.text[:200],
        )
        raise ElevenLabsError(f"Could not create signed ElevenLabs session ({resp.status_code})")

    signed_url = resp.json().get("signed_url")
    if not signed_url:
        raise ElevenLabsError("ElevenLabs signed URL response did not include signed_url")
    return signed_url


async def fetch_conversation(conversation_id: str) -> dict:
    """
    Returns a dict with:
      - status: str — ElevenLabs conversation processing status
      - transcript_text: str  — full transcript as plain text
      - transcript_segments: list[dict] — frontend-ready transcript rows
      - duration_seconds: int — call duration from ElevenLabs metadata
      - raw: dict             — full API response for debugging
    """
    url = f"{_BASE}/convai/conversations/{conversation_id}"
    logger.info("Fetching ElevenLabs transcript for conversation %s", conversation_id)

    async with httpx.AsyncClient(timeout=processing.elevenlabs_timeout_seconds) as client:
        resp = await client.get(url, headers={"xi-api-key": settings.elevenlabs_api_key})

    if resp.status_code == 404:
        logger.warning("ElevenLabs conversation %s not found (404)", conversation_id)
        raise ElevenLabsError(f"Conversation {conversation_id!r} not found")
    if not resp.is_success:
        logger.error(
            "ElevenLabs API error for conversation %s: status=%d body=%s",
            conversation_id, resp.status_code, resp.text[:200],
        )
        raise ElevenLabsError(
            f"ElevenLabs API error {resp.status_code}: {resp.text}"
        )

    data = resp.json()
    status = data.get("status", "unknown")
    turns = data.get("transcript", [])

    lines: list[str] = []
    segments: list[dict] = []
    for idx, turn in enumerate(turns):
        raw_role = turn.get("role", "unknown")
        role = raw_role.capitalize()
        msg = turn.get("message", "").strip()
        if msg:
            lines.append(f"{role}: {msg}")
            seconds = int(turn.get("time_in_call_secs") or 0)
            segments.append(
                {
                    "t": f"{seconds // 60}:{seconds % 60:02d}",
                    "who": "koel" if raw_role == "agent" else "them",
                    "text": msg,
                    "highlight": idx > 0 and raw_role == "agent",
                }
            )

    transcript_text = "\n".join(lines)
    duration_seconds = int(
        data.get("metadata", {}).get("call_duration_secs", 0)
    )

    logger.info(
        "Transcript fetched for conversation %s — status=%s, %d turn(s), %ds",
        conversation_id, status, len(turns), duration_seconds,
    )

    return {
        "status": status,
        "transcript_text": transcript_text,
        "transcript_segments": segments,
        "duration_seconds": duration_seconds,
        "raw": data,
    }


async def fetch_conversation_audio(conversation_id: str) -> tuple[bytes, str]:
    """Fetch the ElevenLabs recording for a completed conversation."""
    url = f"{_BASE}/convai/conversations/{conversation_id}/audio"
    logger.info("Fetching ElevenLabs audio for conversation %s", conversation_id)

    async with httpx.AsyncClient(timeout=processing.elevenlabs_timeout_seconds) as client:
        resp = await client.get(url, headers={"xi-api-key": settings.elevenlabs_api_key})

    if resp.status_code == 404:
        logger.warning("ElevenLabs audio for conversation %s not found (404)", conversation_id)
        raise ElevenLabsError(f"Audio for conversation {conversation_id!r} not found")
    if resp.status_code == 422:
        logger.warning("ElevenLabs audio for conversation %s is not available yet", conversation_id)
        raise ElevenLabsError(f"Audio for conversation {conversation_id!r} is not available")
    if not resp.is_success:
        logger.error(
            "ElevenLabs audio API error for conversation %s: status=%d body=%s",
            conversation_id,
            resp.status_code,
            resp.text[:200],
        )
        raise ElevenLabsError(f"ElevenLabs audio API error {resp.status_code}: {resp.text}")

    content_type = resp.headers.get("content-type") or "audio/mpeg"
    return resp.content, content_type
