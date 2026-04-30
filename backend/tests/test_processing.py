from __future__ import annotations

import asyncio
from types import SimpleNamespace

from services import processing
from services.elevenlabs import ElevenLabsError

from tests.fakes import FakeDB


def run(coro):
    return asyncio.run(coro)


def _conversation(transcript: str = "User: The onboarding flow was clear.") -> dict:
    return {
        "status": "done",
        "transcript_text": transcript,
        "transcript_segments": [
            {"t": "0:01", "who": "them", "text": "The onboarding flow was clear.", "highlight": False}
        ],
        "duration_seconds": 12,
    }


def _fast_polling(monkeypatch) -> None:
    monkeypatch.setattr(
        processing,
        "processing",
        SimpleNamespace(transcript_poll_attempts=1, transcript_poll_delay_seconds=0),
    )


def test_process_response_retries_when_transcript_not_ready(monkeypatch):
    fake_db = FakeDB()
    _fast_polling(monkeypatch)

    async def fetch_not_ready(_conversation_id: str) -> dict:
        return {
            "status": "processing",
            "transcript_text": "",
            "transcript_segments": [],
            "duration_seconds": 0,
        }

    monkeypatch.setattr(processing, "get_client", lambda: fake_db)
    monkeypatch.setattr(processing, "fetch_conversation", fetch_not_ready)

    result = run(processing.process_response("response-1", "survey-1", "conversation-1"))

    assert result.status == processing.PROCESSING_RETRY
    assert result.error == "Transcript was not ready from ElevenLabs"
    assert not any(
        update["payload"].get("processing_status") == "failed"
        for update in fake_db.updates
    )


def test_process_response_missing_conversation_id_fails_response(monkeypatch):
    fake_db = FakeDB()
    monkeypatch.setattr(processing, "get_client", lambda: fake_db)

    result = run(processing.process_response("response-1", "survey-1", "  "))

    assert result.status == processing.PROCESSING_FAILED
    assert result.error == "Response is missing an ElevenLabs conversation id"
    assert fake_db.updates == [
        {
            "table": "responses",
            "payload": {
                "processing_status": "failed",
                "processing_error": "Response is missing an ElevenLabs conversation id",
            },
            "filters": [("id", "response-1")],
        }
    ]


def test_process_response_indexes_before_marking_done(monkeypatch):
    fake_db = FakeDB()
    _fast_polling(monkeypatch)

    async def fetch_ready(_conversation_id: str) -> dict:
        return _conversation()

    async def extract(_transcript: str) -> dict:
        return {
            "quote": "The onboarding flow was clear.",
            "tags": ["onboarding", "clarity"],
            "summary": "The respondent found onboarding clear.",
            "sentiment": "delighted",
        }

    async def index_response(*, response_id: str, survey_id: str) -> None:
        fake_db.events.append(
            {"type": "index", "response_id": response_id, "survey_id": survey_id}
        )

    monkeypatch.setattr(processing, "get_client", lambda: fake_db)
    monkeypatch.setattr(processing, "fetch_conversation", fetch_ready)
    monkeypatch.setattr(processing, "extract_insights", extract)
    monkeypatch.setattr(processing, "index_response", index_response)

    result = run(processing.process_response("response-1", "survey-1", " conversation-1 "))

    assert result.status == processing.PROCESSING_DONE
    event_types = [
        event["type"] if event["type"] == "index" else event["payload"].get("processing_status")
        for event in fake_db.events
    ]
    assert event_types == ["processing", None, "processing", "index", "done"]
    assert fake_db.rpcs == [
        {
            "name": "increment_survey_themes",
            "params": {"p_survey_id": "survey-1", "p_tags": ["onboarding", "clarity"]},
        }
    ]


def test_process_response_llm_failure_returns_retry_not_done(monkeypatch):
    fake_db = FakeDB()
    _fast_polling(monkeypatch)

    async def fetch_ready(_conversation_id: str) -> dict:
        return _conversation()

    async def failing_extract(_transcript: str) -> dict:
        raise RuntimeError("provider unavailable")

    monkeypatch.setattr(processing, "get_client", lambda: fake_db)
    monkeypatch.setattr(processing, "fetch_conversation", fetch_ready)
    monkeypatch.setattr(processing, "extract_insights", failing_extract)

    result = run(processing.process_response("response-1", "survey-1", "conversation-1"))

    assert result.status == processing.PROCESSING_RETRY
    assert result.error == "AI provider was temporarily unavailable"
    assert not any(
        update["payload"].get("processing_status") == "done"
        for update in fake_db.updates
    )


def test_is_recoverable_elevenlabs_error_distinguishes_status_codes():
    assert processing._is_recoverable_elevenlabs_error(
        ElevenLabsError("rate limited", status_code=429)
    )
    assert processing._is_recoverable_elevenlabs_error(
        ElevenLabsError("server error", status_code=503)
    )
    assert not processing._is_recoverable_elevenlabs_error(
        ElevenLabsError("not found", status_code=404)
    )
