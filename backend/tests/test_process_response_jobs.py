from __future__ import annotations

import asyncio
from types import SimpleNamespace

from scripts import process_response_jobs as worker
from services.response_jobs import ResponseProcessingJob


def run(coro):
    return asyncio.run(coro)


def _job(attempts: int = 1) -> ResponseProcessingJob:
    return ResponseProcessingJob(
        id="job-1",
        response_id="response-1",
        survey_id="survey-1",
        conversation_id="conversation-1",
        attempts=attempts,
        max_attempts=5,
    )


def test_retry_result_finishes_job_with_retry_and_backoff(monkeypatch):
    calls: list[dict] = []

    async def retrying_process_response(**_kwargs):
        return SimpleNamespace(status=worker.PROCESSING_RETRY, error="temporary issue")

    def finish(**kwargs):
        calls.append(kwargs)

    monkeypatch.setattr(worker, "process_response", retrying_process_response)
    monkeypatch.setattr(worker, "finish_response_processing_job", finish)

    run(
        worker._process_job(
            _job(attempts=3),
            worker_id="worker-1",
            retry_delay_seconds=10,
            retry_max_delay_seconds=25,
        )
    )

    assert calls == [
        {
            "job_id": "job-1",
            "worker_id": "worker-1",
            "status": "failed",
            "error": "temporary issue",
            "retry": True,
            "retry_delay_seconds": 25,
        }
    ]


def test_done_result_marks_job_succeeded(monkeypatch):
    calls: list[dict] = []

    async def done_process_response(**_kwargs):
        return SimpleNamespace(status=worker.PROCESSING_DONE, error=None)

    def finish(**kwargs):
        calls.append(kwargs)

    monkeypatch.setattr(worker, "process_response", done_process_response)
    monkeypatch.setattr(worker, "finish_response_processing_job", finish)

    run(
        worker._process_job(
            _job(),
            worker_id="worker-1",
            retry_delay_seconds=10,
            retry_max_delay_seconds=60,
        )
    )

    assert calls == [
        {
            "job_id": "job-1",
            "worker_id": "worker-1",
            "status": "succeeded",
            "error": None,
            "retry": False,
            "retry_delay_seconds": 60,
        }
    ]


def test_terminal_failed_result_marks_job_failed_without_retry(monkeypatch):
    calls: list[dict] = []

    async def failed_process_response(**_kwargs):
        return SimpleNamespace(status=worker.PROCESSING_FAILED, error="terminal problem")

    def finish(**kwargs):
        calls.append(kwargs)

    monkeypatch.setattr(worker, "process_response", failed_process_response)
    monkeypatch.setattr(worker, "finish_response_processing_job", finish)

    run(
        worker._process_job(
            _job(),
            worker_id="worker-1",
            retry_delay_seconds=10,
            retry_max_delay_seconds=60,
        )
    )

    assert calls == [
        {
            "job_id": "job-1",
            "worker_id": "worker-1",
            "status": "failed",
            "error": "terminal problem",
            "retry": False,
            "retry_delay_seconds": 60,
        }
    ]


def test_finish_job_db_exception_is_logged_and_swallowed(monkeypatch, caplog):
    async def done_process_response(**_kwargs):
        return SimpleNamespace(status=worker.PROCESSING_DONE, error=None)

    def raising_finish(**_kwargs):
        raise RuntimeError("database unavailable")

    monkeypatch.setattr(worker, "process_response", done_process_response)
    monkeypatch.setattr(worker, "finish_response_processing_job", raising_finish)

    run(
        worker._process_job(
            _job(),
            worker_id="worker-1",
            retry_delay_seconds=10,
            retry_max_delay_seconds=60,
        )
    )

    assert "Could not finish response processing job" in caplog.text


def test_retry_delay_seconds_caps_exponential_backoff():
    assert worker._retry_delay_seconds(_job(attempts=1), 10, 60) == 10
    assert worker._retry_delay_seconds(_job(attempts=3), 10, 60) == 40
    assert worker._retry_delay_seconds(_job(attempts=6), 10, 60) == 60
