"""
Survey endpoints — all require a valid Clerk JWT.

GET  /surveys          → list surveys owned by the authenticated user
GET  /surveys/{id}     → single survey with questions
POST /surveys          → create a new survey

The shareUrl embedded in every SurveyOut is {APP_URL}/s/{short_id}.
short_id is an 8-char URL-safe token generated with secrets.token_urlsafe(6).
"""

import logging
import secrets
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status

from auth.clerk import get_current_user
from config.settings import settings
from db.client import get_client
from db.schemas import (
    QuestionOut,
    QuestionsUpdateRequest,
    SurveyCreateRequest,
    SurveyOut,
    SurveySettings,
    SurveyUpdateRequest,
    VoiceSessionOut,
)
from services.elevenlabs import ElevenLabsError, create_signed_conversation_url

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/surveys", tags=["surveys"])


def _build_share_url(short_id: str) -> str:
    return f"{settings.app_url}/s/{short_id}"


def _format_duration(seconds: int) -> str:
    if seconds == 0:
        return "—"
    m, s = divmod(seconds, 60)
    return f"{m}m {s:02d}s"


def _settings_from_row(survey_row: dict) -> SurveySettings:
    return SurveySettings(
        responseCap=survey_row.get("response_cap"),
        language=survey_row.get("language") or "en",
        followUpDepth=survey_row.get("follow_up_depth") or 2,
        collectRespondentName=survey_row.get("collect_respondent_name") or False,
        allowAnonymousResponses=survey_row.get("allow_anonymous_responses", True),
        emailTranscript=survey_row.get("email_transcript") or False,
        closeOnResponseCap=survey_row.get("close_on_response_cap", True),
    )


def _settings_to_row(settings_body: SurveySettings) -> dict:
    return {
        "response_cap": settings_body.responseCap,
        "language": settings_body.language,
        "follow_up_depth": settings_body.followUpDepth,
        "collect_respondent_name": settings_body.collectRespondentName,
        "allow_anonymous_responses": settings_body.allowAnonymousResponses,
        "email_transcript": settings_body.emailTranscript,
        "close_on_response_cap": settings_body.closeOnResponseCap,
    }


def _question_context(questions: list[dict]) -> str:
    ordered = sorted(questions, key=lambda q: q["order"])
    return "\n".join(f"{idx + 1}. {q['text']}" for idx, q in enumerate(ordered))


def _build_survey_out(survey_row: dict, questions: list[dict], response_stats: dict) -> SurveyOut:
    avg_dur = _format_duration(response_stats.get("avg_duration_seconds", 0))
    total = response_stats.get("total", 0)
    done = response_stats.get("done", 0)
    completion_pct = f"{int(done / total * 100)}%" if total > 0 else "—"

    return SurveyOut(
        id=survey_row["id"],
        title=survey_row["title"],
        description=survey_row["description"],
        status=survey_row["status"],
        responseCount=total,
        avgDuration=avg_dur,
        completionRate=completion_pct,
        questions=[
            QuestionOut(id=q["id"], text=q["text"], order=q["order"])
            for q in sorted(questions, key=lambda q: q["order"])
        ],
        settings=_settings_from_row(survey_row),
        createdAt=survey_row["created_at"],
        shareUrl=_build_share_url(survey_row["short_id"]),
    )


def _get_response_stats(db, survey_id: str) -> dict:
    resp = (
        db.table("responses")
        .select("duration_seconds, processing_status")
        .eq("survey_id", survey_id)
        .execute()
    )
    rows = resp.data or []
    total = len(rows)
    done = sum(1 for r in rows if r["processing_status"] == "done")
    durations = [r["duration_seconds"] for r in rows if r.get("duration_seconds")]
    avg_dur = int(sum(durations) / len(durations)) if durations else 0
    return {"total": total, "done": done, "avg_duration_seconds": avg_dur}


def _active_questions_query(db, survey_id: str):
    return (
        db.table("questions")
        .select("*")
        .eq("survey_id", survey_id)
        .eq("active", True)
        .execute()
    )


def _ensure_owner(db, survey_id: str, user_id: str) -> dict:
    survey_resp = (
        db.table("surveys")
        .select("*")
        .eq("id", survey_id)
        .limit(1)
        .execute()
    )
    survey_row = survey_resp.data[0] if survey_resp.data else None
    if not survey_row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Survey not found")
    if survey_row["user_id"] != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your survey")
    return survey_row


# ─── GET /surveys ─────────────────────────────────────────────────────────────

@router.get("", response_model=list[SurveyOut])
async def list_surveys(user_id: str = Depends(get_current_user)):
    logger.debug("Listing surveys for user %s", user_id)
    db = get_client()

    surveys_resp = (
        db.table("surveys")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    survey_rows = surveys_resp.data or []
    if not survey_rows:
        logger.debug("No surveys found for user %s", user_id)
        return []

    survey_ids = [s["id"] for s in survey_rows]

    questions_resp = (
        db.table("questions")
        .select("*")
        .in_("survey_id", survey_ids)
        .eq("active", True)
        .execute()
    )
    all_questions: list[dict] = questions_resp.data or []
    questions_by_survey: dict[str, list[dict]] = {}
    for q in all_questions:
        questions_by_survey.setdefault(q["survey_id"], []).append(q)

    result = []
    for survey_row in survey_rows:
        sid = survey_row["id"]
        stats = _get_response_stats(db, sid)
        result.append(
            _build_survey_out(survey_row, questions_by_survey.get(sid, []), stats)
        )

    logger.debug("Returning %d survey(s) for user %s", len(result), user_id)
    return result


# ─── public lookup/session endpoints ─────────────────────────────────────────

@router.get("/share/{short_id}", response_model=SurveyOut)
async def get_public_survey(short_id: str):
    logger.debug("Public survey lookup short_id=%s", short_id)
    db = get_client()

    survey_resp = (
        db.table("surveys")
        .select("*")
        .eq("short_id", short_id)
        .limit(1)
        .execute()
    )
    survey_row = survey_resp.data[0] if survey_resp.data else None
    if not survey_row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Survey not found")

    questions_resp = _active_questions_query(db, survey_row["id"])
    stats = _get_response_stats(db, survey_row["id"])
    return _build_survey_out(survey_row, questions_resp.data or [], stats)


@router.post("/share/{short_id}/voice-session", response_model=VoiceSessionOut)
async def start_public_voice_session(short_id: str):
    logger.debug("Voice session requested short_id=%s", short_id)
    db = get_client()
    survey_resp = (
        db.table("surveys")
        .select("*")
        .eq("short_id", short_id)
        .limit(1)
        .execute()
    )
    survey_row = survey_resp.data[0] if survey_resp.data else None
    if not survey_row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Survey not found")
    if survey_row["status"] != "live":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This survey is not accepting responses",
        )

    cap = survey_row.get("response_cap")
    if cap is not None and _get_response_stats(db, survey_row["id"])["total"] >= cap:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This survey has reached its response cap",
        )

    questions_resp = _active_questions_query(db, survey_row["id"])
    questions = questions_resp.data or []
    try:
        signed_url = await create_signed_conversation_url()
    except ElevenLabsError as exc:
        logger.warning("Could not create ElevenLabs signed URL: %s", exc)
        if not settings.elevenlabs_agent_id:
            return VoiceSessionOut()
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Could not start the voice session",
        ) from exc

    survey_settings = _settings_from_row(survey_row)
    return VoiceSessionOut(
        status="ready",
        signedUrl=signed_url,
        dynamicVariables={
            "survey_id": survey_row["id"],
            "survey_title": survey_row["title"],
            "survey_description": survey_row["description"],
            "survey_questions": _question_context(questions),
            "language": survey_settings.language,
            "follow_up_depth": survey_settings.followUpDepth,
            "collect_respondent_name": survey_settings.collectRespondentName,
            "allow_anonymous_responses": survey_settings.allowAnonymousResponses,
        },
    )


# ─── GET /surveys/{id} ────────────────────────────────────────────────────────

@router.get("/{survey_id}", response_model=SurveyOut)
async def get_survey(survey_id: UUID, user_id: str = Depends(get_current_user)):
    sid = str(survey_id)
    logger.debug("Fetching survey %s for user %s", sid, user_id)
    db = get_client()

    survey_row = _ensure_owner(db, sid, user_id)
    questions_resp = _active_questions_query(db, sid)
    questions = questions_resp.data or []
    stats = _get_response_stats(db, sid)

    logger.debug("Returning survey %s (%d questions)", sid, len(questions))
    return _build_survey_out(survey_row, questions, stats)


# ─── POST /surveys ────────────────────────────────────────────────────────────

@router.post("", response_model=SurveyOut, status_code=status.HTTP_201_CREATED)
async def create_survey(
    body: SurveyCreateRequest,
    user_id: str = Depends(get_current_user),
):
    logger.info("Creating survey %r for user %s", body.title, user_id)
    db = get_client()

    # secrets.token_urlsafe(6) → base64url(6 bytes) → exactly 8 chars
    # ~281 trillion possibilities; collision at 1M surveys ≈ 0.0000004%
    short_id = secrets.token_urlsafe(6)

    survey_insert = (
        db.table("surveys")
        .insert(
            {
                "user_id": user_id,
                "title": body.title,
                "description": body.description,
                "status": body.status,
                "short_id": short_id,
                **_settings_to_row(body.settings),
            }
        )
        .execute()
    )
    survey_row = survey_insert.data[0]
    survey_id = survey_row["id"]

    questions: list[dict] = []
    if body.questions:
        q_rows = [
            {"survey_id": survey_id, "text": q.text, "order": q.order}
            for q in body.questions
        ]
        q_insert = db.table("questions").insert(q_rows).execute()
        questions = q_insert.data or []

    logger.info(
        "Survey %s created (short_id=%s, %d question(s), status=%s)",
        survey_id, short_id, len(questions), body.status,
    )
    return _build_survey_out(survey_row, questions, {"total": 0, "done": 0, "avg_duration_seconds": 0})


# ─── PATCH /surveys/{id} ─────────────────────────────────────────────────────

@router.patch("/{survey_id}", response_model=SurveyOut)
async def update_survey(
    survey_id: UUID,
    body: SurveyUpdateRequest,
    user_id: str = Depends(get_current_user),
):
    sid = str(survey_id)
    db = get_client()
    _ensure_owner(db, sid, user_id)

    patch: dict = {}
    if body.title is not None:
        patch["title"] = body.title
    if body.description is not None:
        patch["description"] = body.description
    if body.status is not None:
        patch["status"] = body.status
    if body.settings is not None:
        patch.update(_settings_to_row(body.settings))

    if patch:
        survey_resp = (
            db.table("surveys")
            .update(patch)
            .eq("id", sid)
            .execute()
        )
        survey_row = survey_resp.data[0]
    else:
        survey_row = _ensure_owner(db, sid, user_id)

    questions_resp = _active_questions_query(db, sid)
    stats = _get_response_stats(db, sid)
    return _build_survey_out(survey_row, questions_resp.data or [], stats)


# ─── PUT /surveys/{id}/questions ─────────────────────────────────────────────

@router.put("/{survey_id}/questions", response_model=SurveyOut)
async def update_questions(
    survey_id: UUID,
    body: QuestionsUpdateRequest,
    user_id: str = Depends(get_current_user),
):
    sid = str(survey_id)
    db = get_client()
    survey_row = _ensure_owner(db, sid, user_id)
    next_questions = [
        {"id": q.id, "text": q.text.strip(), "order": i + 1}
        for i, q in enumerate(body.questions)
        if q.text.strip()
    ]

    if survey_row["status"] == "draft":
        db.table("questions").delete().eq("survey_id", sid).execute()
        if next_questions:
            db.table("questions").insert(
                [
                    {"survey_id": sid, "text": q["text"], "order": q["order"], "active": True}
                    for q in next_questions
                ]
            ).execute()
    else:
        current_resp = _active_questions_query(db, sid)
        current_by_id = {q["id"]: q for q in (current_resp.data or [])}
        keep_ids = {q["id"] for q in next_questions if q["id"]}

        for old_id, old in current_by_id.items():
            if old_id not in keep_ids:
                db.table("questions").update({"active": False}).eq("id", old_id).execute()

        for q in next_questions:
            old = current_by_id.get(q["id"]) if q["id"] else None
            if old and old["text"] == q["text"]:
                if old["order"] != q["order"]:
                    db.table("questions").update({"order": q["order"]}).eq("id", old["id"]).execute()
                continue
            if old:
                db.table("questions").update({"active": False}).eq("id", old["id"]).execute()
            db.table("questions").insert(
                {"survey_id": sid, "text": q["text"], "order": q["order"], "active": True}
            ).execute()

    survey_row = _ensure_owner(db, sid, user_id)
    questions_resp = _active_questions_query(db, sid)
    stats = _get_response_stats(db, sid)
    return _build_survey_out(survey_row, questions_resp.data or [], stats)
