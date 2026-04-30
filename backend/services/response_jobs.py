"""Database-backed queue helpers for response processing jobs."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

from db.client import get_client
from db.schemas import ResponseSubmitRequest

JobFinalStatus = Literal["succeeded", "failed"]


class PublicResponseSubmissionRejected(Exception):
    """Raised when the public response RPC rejects a submission."""

    def __init__(self, reason: str) -> None:
        super().__init__(reason)
        self.reason = reason


class ResponseProcessingRetryRejected(Exception):
    """Raised when a manual retry is rejected by the database guard."""

    def __init__(self, reason: str, current_status: str | None = None) -> None:
        super().__init__(reason)
        self.reason = reason
        self.current_status = current_status


@dataclass(frozen=True)
class ResponseProcessingJob:
    id: str
    response_id: str
    survey_id: str
    conversation_id: str
    attempts: int
    max_attempts: int


def create_response_with_processing_job(
    survey_id: str,
    body: ResponseSubmitRequest,
) -> str:
    """Create a response row and durable processing job in one DB transaction."""
    db = get_client()
    resp = (
        db.rpc(
            "create_response_with_processing_job",
            {
                "p_survey_id": survey_id,
                "p_conversation_id": body.conversation_id,
                "p_respondent_name": body.respondent_name,
                "p_respondent_role": body.respondent_role,
                "p_is_anonymous": body.is_anonymous,
            },
        )
        .execute()
    )
    row = _first_row(resp.data)
    return row["id"]


def create_public_response_with_processing_job(
    short_id: str,
    body: ResponseSubmitRequest,
) -> str:
    """Create a public response/job if the survey can still accept it."""
    db = get_client()
    resp = (
        db.rpc(
            "create_public_response_with_processing_job",
            {
                "p_short_id": short_id,
                "p_conversation_id": body.conversation_id,
                "p_respondent_name": body.respondent_name,
                "p_respondent_role": body.respondent_role,
                "p_is_anonymous": body.is_anonymous,
            },
        )
        .execute()
    )
    row = _first_row(resp.data)
    if row.get("rejection_reason"):
        raise PublicResponseSubmissionRejected(row["rejection_reason"])
    return row["id"]


def requeue_response_processing_job(response_id: str) -> None:
    """Reset an existing response to pending and enqueue a fresh job attempt."""
    db = get_client()
    resp = (
        db.rpc(
            "requeue_response_processing_job",
            {"p_response_id": response_id},
        )
        .execute()
    )
    row = _first_row(resp.data)
    if row.get("rejection_reason"):
        raise ResponseProcessingRetryRejected(
            row["rejection_reason"],
            row.get("current_status"),
        )


def claim_response_processing_jobs(
    worker_id: str,
    batch_size: int,
    lease_seconds: int,
) -> list[ResponseProcessingJob]:
    """Atomically claim ready jobs for this worker."""
    db = get_client()
    resp = (
        db.rpc(
            "claim_response_processing_jobs",
            {
                "p_worker_id": worker_id,
                "p_batch_size": batch_size,
                "p_lease_seconds": lease_seconds,
            },
        )
        .execute()
    )
    return [_job_from_row(row) for row in (resp.data or [])]


def finish_response_processing_job(
    job_id: str,
    worker_id: str,
    status: JobFinalStatus,
    error: str | None = None,
    retry: bool = False,
    retry_delay_seconds: int = 60,
) -> None:
    """Mark a claimed job succeeded, failed, or queued for a retry."""
    db = get_client()
    db.rpc(
        "finish_response_processing_job",
        {
            "p_job_id": job_id,
            "p_worker_id": worker_id,
            "p_status": status,
            "p_error": error,
            "p_retry": retry,
            "p_retry_delay_seconds": retry_delay_seconds,
        },
    ).execute()


def _first_row(data: object) -> dict:
    if isinstance(data, list) and data:
        return data[0]
    if isinstance(data, dict):
        return data
    raise RuntimeError("Supabase RPC returned no response row")


def _job_from_row(row: dict) -> ResponseProcessingJob:
    return ResponseProcessingJob(
        id=row["id"],
        response_id=row["response_id"],
        survey_id=row["survey_id"],
        conversation_id=row["conversation_id"],
        attempts=row.get("attempts") or 0,
        max_attempts=row.get("max_attempts") or 0,
    )
