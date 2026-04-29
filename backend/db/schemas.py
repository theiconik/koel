"""
Pydantic request / response models.

Shapes mirror the TypeScript types in frontend/lib/types/index.ts so the
frontend data layer requires no changes when switching from mock to real API.
"""

from __future__ import annotations

from typing import Literal
from pydantic import BaseModel, Field

# ─── shared primitives ───────────────────────────────────────────────────────

SurveyStatus = Literal["live", "draft", "closed"]
ProcessingStatus = Literal["pending", "processing", "done", "failed"]


# ─── survey ──────────────────────────────────────────────────────────────────

class QuestionIn(BaseModel):
    id: str | None = None
    text: str
    order: int = 0


class QuestionOut(BaseModel):
    id: str
    text: str
    order: int


class SurveySettings(BaseModel):
    responseCap: int | None = None
    language: str = "en"
    followUpDepth: int = 2
    collectRespondentName: bool = False
    allowAnonymousResponses: bool = True
    emailTranscript: bool = False
    closeOnResponseCap: bool = True


class SurveyCreateRequest(BaseModel):
    title: str
    description: str = ""
    status: SurveyStatus = "draft"
    questions: list[QuestionIn] = Field(default_factory=list)
    settings: SurveySettings = Field(default_factory=SurveySettings)


class SurveyUpdateRequest(BaseModel):
    title: str | None = None
    description: str | None = None
    status: SurveyStatus | None = None
    settings: SurveySettings | None = None


class QuestionsUpdateRequest(BaseModel):
    questions: list[QuestionIn] = Field(default_factory=list)


class SurveyOut(BaseModel):
    """Matches the frontend Survey interface exactly."""
    id: str
    title: str
    description: str
    status: SurveyStatus
    responseCount: int
    avgDuration: str
    completionRate: str
    questions: list[QuestionOut]
    settings: SurveySettings
    createdAt: str
    shareUrl: str


# ─── response ────────────────────────────────────────────────────────────────

class TranscriptSegment(BaseModel):
    t: str
    who: Literal["koel", "them"]
    text: str
    highlight: bool = False

class ResponseSubmitRequest(BaseModel):
    """Body for POST /surveys/{id}/responses — sent by the respondent client."""
    conversation_id: str
    respondent_name: str | None = None
    respondent_role: str | None = None
    is_anonymous: bool = False


class ResponseSubmitAck(BaseModel):
    """Immediate acknowledgement returned to the respondent."""
    id: str
    status: ProcessingStatus


class ResponseOut(BaseModel):
    """Matches the frontend Response interface exactly."""
    id: str
    surveyId: str
    respondentName: str
    respondentRole: str
    isAnonymous: bool
    quote: str
    duration: str
    durationSeconds: int
    tags: list[str]
    sentiment: Literal["delighted", "neutral", "frustrated"]
    transcript: list[TranscriptSegment]
    koelSummary: str
    processingStatus: ProcessingStatus
    processingError: str | None = None
    audioUrl: str | None = None
    createdAt: str


class VoiceSessionOut(BaseModel):
    conversationId: str | None = None
    provider: str = "elevenlabs"
    status: Literal["ready", "not_configured"] = "not_configured"
    signedUrl: str | None = None
    dynamicVariables: dict[str, str | int | bool] = Field(default_factory=dict)


# ─── insights chat ───────────────────────────────────────────────────────────

class InsightsChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)


class InsightsChatResponse(BaseModel):
    answer: str
    route: Literal["rag", "analytics", "hybrid"]


# ─── theme ───────────────────────────────────────────────────────────────────

class ThemeOut(BaseModel):
    """Matches the frontend Theme interface exactly."""
    name: str
    count: int
    color: str
    summary: str | None = None
    quotes: list[dict] = Field(default_factory=list)


class DashboardStatsOut(BaseModel):
    activeSurveys: int
    voicesThisWeek: int
    hoursOfAudio: float
    completionRate: str
    voicesNote: str
