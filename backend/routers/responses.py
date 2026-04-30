"""
Response endpoints — public (no Clerk auth required).

Respondents are not signed-in users; they access the survey via share link.

POST /surveys/{survey_id}/responses
  Body: { conversation_id, respondent_name?, respondent_role?, is_anonymous }
  → Creates a response row with processing_status="pending"
  → Enqueues durable response processing work in the database
  → Returns { id, status: "pending" } immediately

GET /surveys/{survey_id}/responses
  → Returns processed response list for the survey creator (used by the
    frontend hooks that populate the "voices" tab).

GET /surveys/{survey_id}/themes
  → Returns per-survey theme list (name, count, color).
"""

import logging
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Response, status

from auth.clerk import get_current_user
from db.client import get_client
from db.schemas import (
    ResponseOut,
    ResponseSubmitAck,
    ResponseSubmitRequest,
    ThemeOut,
)
from services.elevenlabs import ElevenLabsError, fetch_conversation_audio
from services.response_jobs import (
    PublicResponseSubmissionRejected,
    ResponseProcessingRetryRejected,
    create_public_response_with_processing_job,
    create_response_with_processing_job,
    requeue_response_processing_job,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/surveys", tags=["responses"])


def _format_duration(seconds: int | None) -> str:
    if not seconds:
        return "—"
    m, s = divmod(seconds, 60)
    return f"{m}m {s:02d}s"


def _ensure_owner(db, survey_id: str, user_id: str) -> dict:
    survey_resp = (
        db.table("surveys")
        .select("id, user_id")
        .eq("id", survey_id)
        .limit(1)
        .execute()
    )
    survey = survey_resp.data[0] if survey_resp.data else None
    if not survey:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Survey not found")
    if survey["user_id"] != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your survey")
    return survey


def _fallback_transcript(transcript: str | None) -> list[dict]:
    if not transcript:
        return []
    rows = []
    for idx, line in enumerate(transcript.splitlines()):
        role, _, text = line.partition(":")
        who = "koel" if role.strip().lower() in {"agent", "koel", "assistant"} else "them"
        rows.append({"t": f"0:{idx:02d}", "who": who, "text": text.strip() or line.strip(), "highlight": False})
    return rows


def _response_out(r: dict) -> ResponseOut:
    duration_seconds = r.get("duration_seconds") or 0
    audio_url = (
        f"/surveys/{r['survey_id']}/responses/{r['id']}/audio"
        if r.get("conversation_id")
        else None
    )
    return ResponseOut(
        id=r["id"],
        surveyId=r["survey_id"],
        respondentName=r["respondent_name"] or "anon",
        respondentRole=r["respondent_role"] or "—",
        isAnonymous=r["is_anonymous"],
        quote=r.get("quote") or "",
        duration=_format_duration(duration_seconds),
        durationSeconds=duration_seconds,
        tags=r.get("tags") or [],
        sentiment=r.get("sentiment") or "neutral",
        transcript=r.get("transcript_json") or _fallback_transcript(r.get("transcript")),
        koelSummary=r.get("summary") or "",
        processingStatus=r.get("processing_status") or "pending",
        processingError=r.get("processing_error"),
        audioUrl=audio_url,
        createdAt=r["created_at"],
    )


async def _insert_response(
    survey_id: str,
    body: ResponseSubmitRequest,
) -> ResponseSubmitAck:
    response_id = create_response_with_processing_job(survey_id, body)
    return ResponseSubmitAck(id=response_id, status="pending")


# ─── POST /surveys/share/{short_id}/responses ────────────────────────────────

@router.post(
    "/share/{short_id}/responses",
    response_model=ResponseSubmitAck,
    status_code=status.HTTP_202_ACCEPTED,
)
async def submit_public_response(
    short_id: str,
    body: ResponseSubmitRequest,
):
    try:
        response_id = create_public_response_with_processing_job(short_id, body)
    except PublicResponseSubmissionRejected as exc:
        if exc.reason == "survey_not_found":
            logger.warning("Response rejected — survey short_id=%s not found", short_id)
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Survey not found",
            ) from exc
        if exc.reason == "response_cap_reached":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This survey has reached its response cap",
            ) from exc
        if exc.reason == "anonymous_responses_not_allowed":
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="Anonymous responses are not allowed for this survey",
            ) from exc
        if exc.reason == "respondent_name_required":
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="Respondent name is required for this survey",
            ) from exc
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This survey is not accepting responses",
        ) from exc

    return ResponseSubmitAck(id=response_id, status="pending")


# ─── POST /surveys/{survey_id}/responses ─────────────────────────────────────

@router.post(
    "/{survey_id}/responses",
    response_model=ResponseSubmitAck,
    status_code=status.HTTP_202_ACCEPTED,
)
async def submit_response(
    survey_id: UUID,
    body: ResponseSubmitRequest,
    user_id: str = Depends(get_current_user),
):
    sid = str(survey_id)
    logger.info(
        "Response submission received: survey=%s conversation=%s anonymous=%s",
        sid, body.conversation_id, body.is_anonymous,
    )
    db = get_client()
    _ensure_owner(db, sid, user_id)
    survey_resp = (
        db.table("surveys")
        .select("id, status")
        .eq("id", sid)
        .limit(1)
        .execute()
    )
    survey = survey_resp.data[0] if survey_resp.data else None
    if not survey:
        logger.warning("Response rejected — survey %s not found", sid)
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Survey not found")
    if survey["status"] != "live":
        logger.warning(
            "Response rejected — survey %s is not live (status=%s)",
            sid, survey["status"],
        )
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This survey is not accepting responses",
        )

    return await _insert_response(sid, body)


# ─── GET /surveys/{survey_id}/responses ──────────────────────────────────────

@router.post("/{survey_id}/responses/{response_id}/retry", response_model=ResponseSubmitAck)
async def retry_response_processing(
    survey_id: UUID,
    response_id: UUID,
    user_id: str = Depends(get_current_user),
):
    sid = str(survey_id)
    rid = str(response_id)
    db = get_client()
    _ensure_owner(db, sid, user_id)

    resp = (
        db.table("responses")
        .select("id, survey_id, conversation_id, processing_status")
        .eq("id", rid)
        .eq("survey_id", sid)
        .limit(1)
        .execute()
    )
    response = resp.data[0] if resp.data else None
    if not response:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Response not found")
    if not response.get("conversation_id"):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Response has no conversation id to retry",
        )
    processing_status = response.get("processing_status") or "pending"
    if processing_status != "failed":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Only failed responses can be retried (current status: {processing_status})",
        )

    try:
        requeue_response_processing_job(rid)
    except ResponseProcessingRetryRejected as exc:
        if exc.reason == "response_not_found":
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Response not found",
            ) from exc
        if exc.reason == "missing_conversation_id":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Response has no conversation id to retry",
            ) from exc
        if exc.reason == "active_processing_job":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Response already has an active processing job",
            ) from exc
        current_status = exc.current_status or "unknown"
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Only failed responses can be retried (current status: {current_status})",
        ) from exc
    return ResponseSubmitAck(id=rid, status="pending")


# ─── GET /surveys/{survey_id}/responses/{response_id}/audio ─────────────────

@router.get("/{survey_id}/responses/{response_id}/audio")
async def get_response_audio(
    survey_id: UUID,
    response_id: UUID,
    user_id: str = Depends(get_current_user),
):
    sid = str(survey_id)
    rid = str(response_id)
    db = get_client()
    _ensure_owner(db, sid, user_id)

    resp = (
        db.table("responses")
        .select("id, survey_id, conversation_id")
        .eq("id", rid)
        .eq("survey_id", sid)
        .limit(1)
        .execute()
    )
    response = resp.data[0] if resp.data else None
    if not response:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Response not found")
    if not response.get("conversation_id"):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Response has no conversation recording",
        )

    try:
        content, media_type = await fetch_conversation_audio(response["conversation_id"])
    except ElevenLabsError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Could not fetch response audio",
        ) from exc

    return Response(
        content=content,
        media_type=media_type,
        headers={
            "Cache-Control": "private, max-age=300",
            "Content-Disposition": f'inline; filename="koel-response-{rid}.mp3"',
        },
    )


# ─── GET /surveys/{survey_id}/responses ──────────────────────────────────────

@router.get("/{survey_id}/responses", response_model=list[ResponseOut])
async def list_responses(
    survey_id: UUID,
    user_id: str = Depends(get_current_user),
):
    sid = str(survey_id)
    logger.debug("Listing responses for survey %s", sid)
    db = get_client()
    _ensure_owner(db, sid, user_id)

    resp = (
        db.table("responses")
        .select("*")
        .eq("survey_id", sid)
        .order("created_at", desc=True)
        .execute()
    )
    rows = resp.data or []
    logger.debug("Returning %d processed response(s) for survey %s", len(rows), sid)

    return [_response_out(r) for r in rows]


# ─── GET /surveys/{survey_id}/themes ─────────────────────────────────────────

@router.get("/{survey_id}/themes", response_model=list[ThemeOut])
async def list_themes(
    survey_id: UUID,
    user_id: str = Depends(get_current_user),
):
    sid = str(survey_id)
    logger.debug("Listing themes for survey %s", sid)
    db = get_client()
    _ensure_owner(db, sid, user_id)

    resp = (
        db.table("themes")
        .select("name, count, color, summary, quotes")
        .eq("survey_id", sid)
        .order("count", desc=True)
        .execute()
    )
    rows = resp.data or []
    logger.debug("Returning %d theme(s) for survey %s", len(rows), sid)

    return [
        ThemeOut(
            name=r["name"],
            count=r["count"],
            color=r.get("color") or "#E8B04B",
            summary=r.get("summary"),
            quotes=r.get("quotes") or [],
        )
        for r in rows
    ]
