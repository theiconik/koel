from __future__ import annotations

import re

import pytest
from fastapi.testclient import TestClient

from config.log_context import request_id_from_header
from main import app
from routers import responses as responses_router
from services.response_jobs import PublicResponseSubmissionRejected

from tests.fakes import FakeDB


def test_health_preserves_safe_incoming_request_id():
    client = TestClient(app)

    response = client.get("/health", headers={"X-Request-ID": "safe-request-id-123"})

    assert response.status_code == 200
    assert response.headers["X-Request-ID"] == "safe-request-id-123"


def test_health_generates_request_id_when_absent():
    client = TestClient(app)

    response = client.get("/health")

    assert response.status_code == 200
    request_id = response.headers["X-Request-ID"]
    assert re.fullmatch(r"[0-9a-f]{32}", request_id)


def test_request_id_from_header_rejects_unsafe_values():
    request_id = request_id_from_header("unsafe\nheader")

    assert request_id != "unsafe\nheader"
    assert re.fullmatch(r"[0-9a-f]{32}", request_id)
    assert request_id_from_header(" safe-value ") == "safe-value"


@pytest.mark.parametrize(
    ("reason", "expected_status", "expected_detail"),
    [
        ("survey_not_found", 404, "Survey not found"),
        ("response_cap_reached", 409, "This survey has reached its response cap"),
        ("anonymous_responses_not_allowed", 422, "Anonymous responses are not allowed for this survey"),
        ("respondent_name_required", 422, "Respondent name is required for this survey"),
        ("survey_not_accepting_responses", 409, "This survey is not accepting responses"),
    ],
)
def test_public_response_submission_maps_rejection_reasons(
    monkeypatch,
    reason: str,
    expected_status: int,
    expected_detail: str,
):
    def reject(_short_id, _body):
        raise PublicResponseSubmissionRejected(reason)

    monkeypatch.setattr(responses_router, "create_public_response_with_processing_job", reject)
    client = TestClient(app)

    response = client.post(
        "/surveys/share/public123/responses",
        json={
            "conversation_id": "conversation-1",
            "respondent_name": "Ada",
            "respondent_role": "Researcher",
            "is_anonymous": False,
        },
    )

    assert response.status_code == expected_status
    assert response.json()["detail"] == expected_detail


def test_retry_endpoint_rejects_non_failed_response_status(monkeypatch):
    survey_id = "11111111-1111-1111-1111-111111111111"
    response_id = "22222222-2222-2222-2222-222222222222"
    fake_db = FakeDB(
        {
            "surveys": [{"id": survey_id, "user_id": "user-1"}],
            "responses": [
                {
                    "id": response_id,
                    "survey_id": survey_id,
                    "conversation_id": "conversation-1",
                    "processing_status": "processing",
                }
            ],
        }
    )

    monkeypatch.setattr(responses_router, "get_client", lambda: fake_db)
    app.dependency_overrides[responses_router.get_current_user] = lambda: "user-1"
    client = TestClient(app)
    try:
        response = client.post(f"/surveys/{survey_id}/responses/{response_id}/retry")
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 409
    assert response.json()["detail"] == (
        "Only failed responses can be retried (current status: processing)"
    )
