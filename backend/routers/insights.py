"""Authenticated survey insights chat endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status

from auth.clerk import get_current_user
from db.client import get_client
from db.schemas import InsightsChatRequest, InsightsChatResponse
from services.insights_chat import answer_survey_question

router = APIRouter(prefix="/surveys", tags=["insights"])


def _ensure_owner(db, survey_id: str, user_id: str) -> None:
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


@router.post("/{survey_id}/insights/chat", response_model=InsightsChatResponse)
async def chat_with_survey_insights(
    survey_id: UUID,
    body: InsightsChatRequest,
    user_id: str = Depends(get_current_user),
) -> InsightsChatResponse:
    sid = str(survey_id)
    db = get_client()
    _ensure_owner(db, sid, user_id)

    result = await answer_survey_question(sid, body.message)
    return InsightsChatResponse(answer=result["answer"], route=result["route"])
