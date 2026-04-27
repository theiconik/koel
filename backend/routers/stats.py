"""Dashboard summary stats for the authenticated creator."""

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends

from auth.clerk import get_current_user
from db.client import get_client
from db.schemas import DashboardStatsOut

router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("", response_model=DashboardStatsOut)
async def get_stats(user_id: str = Depends(get_current_user)):
    db = get_client()

    surveys_resp = (
        db.table("surveys")
        .select("id, status")
        .eq("user_id", user_id)
        .execute()
    )
    surveys = surveys_resp.data or []
    survey_ids = [s["id"] for s in surveys]

    if not survey_ids:
        return DashboardStatsOut(
            activeSurveys=0,
            voicesThisWeek=0,
            hoursOfAudio=0,
            completionRate="—",
            voicesNote="no voices yet",
        )

    since = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
    responses_resp = (
        db.table("responses")
        .select("duration_seconds, processing_status, created_at")
        .in_("survey_id", survey_ids)
        .execute()
    )
    responses = responses_resp.data or []
    total = len(responses)
    done = sum(1 for r in responses if r.get("processing_status") == "done")
    week = sum(1 for r in responses if (r.get("created_at") or "") >= since)
    seconds = sum(r.get("duration_seconds") or 0 for r in responses)
    completion = f"{int(done / total * 100)}%" if total else "—"

    return DashboardStatsOut(
        activeSurveys=sum(1 for s in surveys if s["status"] == "live"),
        voicesThisWeek=week,
        hoursOfAudio=round(seconds / 3600, 1),
        completionRate=completion,
        voicesNote=f"{week} this week",
    )
