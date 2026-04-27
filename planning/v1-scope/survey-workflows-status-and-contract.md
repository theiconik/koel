# Survey Workflows Status and Frontend-Backend Contract

Date: 2026-04-26



This document covers the scoped product area for koel:

- creating a survey
- seeing survey lists and survey detail
- responding to a survey
- seeing responses and response details
- mapping themes
- updating survey questions
- updating survey settings

## Current Status

The project has a strong skeleton on both sides. The frontend has most of the scoped screens and interaction surfaces. The backend has the first real FastAPI/Supabase foundation for surveys, responses, transcript fetching, LLM enrichment, and theme aggregation.

The application is not yet functionally wired end to end. The frontend still defaults to mock data, keeps created surveys in client state, and has no mutation API layer. The backend exposes some of the needed APIs, but the response shape, share-link flow, auth behavior, update endpoints, and settings model do not yet match what the frontend needs.

## What Has Been Done

### Frontend

- Next.js app router structure is in place with separate dashboard, auth, respondent, and marketing route groups.
- Clerk protects dashboard routes through `frontend/proxy.ts`; respondent share routes under `/s/*` are public.
- Dashboard layout mounts `SurveysProvider`, which loads surveys through `frontend/lib/data/index.ts`.
- Mock-first data access exists for surveys, individual survey lookup, public slug lookup, responses, themes, and dashboard stats.
- Survey list exists at `frontend/app/(dashboard)/surveys/page.tsx` with search, status filters, and survey cards.
- New survey screen exists at `frontend/app/(dashboard)/surveys/new/page.tsx` with title, question drafting, adding/removing questions, preview card, and publish CTA.
- New survey publish currently creates an in-memory `Survey` object, adds it to `SurveysContext`, and routes to the published page.
- Published page exists at `frontend/app/(dashboard)/surveys/[id]/published/page.tsx` with share link, copy toast, share modal, and next-step messaging.
- Survey detail exists at `frontend/app/(dashboard)/surveys/[id]/page.tsx` with `voices`, `themes`, `questions`, and `settings` tabs.
- Voices tab shows response cards, an empty state, auto-theme side panel, and opens a response detail drawer.
- Response detail drawer shows respondent metadata, simulated audio player, tags, transcript, sentiment, and summary.
- Themes tab renders theme cards with counts, summaries, and quotes from mock data.
- Questions tab renders survey questions and per-question analytics from mock data.
- Settings tab renders status/access, response cap, language, follow-up depth, close, and delete controls.
- Respondent survey page exists at `frontend/app/(respondent)/s/[slug]/page.tsx` and loads survey data by slug.
- Respondent client UI is voice-first: landing, microphone permission, orb conversation, ending confirmation, and thank-you screen.
- A `VoiceAgentSession` interface and mock voice agent exist in `frontend/lib/voice/agent.ts`.

### Backend

- FastAPI application entry point exists at `backend/main.py` with CORS, lifespan, health check, and router registration.
- Clerk JWT verification exists in `backend/auth/clerk.py`, returning the authenticated Clerk user id.
- Supabase client singleton exists in `backend/db/client.py`.
- Initial SQL schema exists in `backend/db/migrations/001_init.sql` for `surveys`, `questions`, `responses`, and `themes`.
- Pydantic request/response schemas exist in `backend/db/schemas.py`.
- Authenticated survey endpoints exist:
  - `GET /surveys`
  - `GET /surveys/{survey_id}`
  - `POST /surveys`
- Survey creation stores survey metadata, generated `short_id`, and questions.
- Survey list/detail responses include computed response count, average duration, completion rate, questions, and share URL.
- Public response submission exists:
  - `POST /surveys/{survey_id}/responses`
- Response submission validates that the survey exists and is live, creates a pending response row, and starts background processing.
- Processed response list exists:
  - `GET /surveys/{survey_id}/responses`
- Theme list exists:
  - `GET /surveys/{survey_id}/themes`
- Background response processing exists in `backend/services/processing.py`.
- ElevenLabs transcript fetching exists in `backend/services/elevenlabs.py`.
- OpenRouter-based insight extraction exists in `backend/services/llm.py`.
- Theme counts are incremented from extracted tags during processing.

## Key Gaps

### Cross-Cutting Integration Gaps

- Frontend defaults to mock mode with `NEXT_PUBLIC_USE_MOCK !== "false"`.
- Frontend `apiFetch` does not attach Clerk bearer tokens, but backend survey create/list/detail routes require Clerk JWTs.
- Frontend share routes use `/s/{slug}`; backend builds share URLs as `{APP_URL}/r/{short_id}`.
- Frontend calls `GET /surveys/share/{slug}` for public respondent lookup; backend does not implement this endpoint.
- Backend route `GET /surveys/{survey_id}` expects a UUID, so public short-id lookup should not be implemented as a conflicting `{survey_id}` path.
- Frontend created survey ids are currently timestamp strings; backend survey ids are UUIDs.
- Frontend has no API mutation functions for create, update, delete, questions, settings, response submission, tags, or theme mapping.
- Backend response list currently omits fields the frontend response drawer requires: `durationSeconds`, `sentiment`, structured `transcript`, and `koelSummary`.
- Backend LLM extraction returns `summary`, but processing does not persist it.
- Backend database stores transcript as plain text, while frontend expects timed speaker segments.
- Backend themes currently return only `name`, `count`, and hard-coded color; frontend can display `summary` and quotes but backend does not produce them.
- `GET /surveys/{survey_id}/responses` and `GET /surveys/{survey_id}/themes` are currently unauthenticated, although they expose creator data.
- Settings UI is local-only and has no backend persistence model.
- Questions tab has no edit mode or backend update route.
- Response drawer controls for transcript download and tag adding are UI-only.
- Respondent voice UI uses a mock scripted agent and does not create a real ElevenLabs session or submit a `conversation_id`.

### Scope-Specific Gaps

#### Creating Survey

- Frontend should call backend `POST /surveys`; it currently creates a local object.
- Backend creation exists, but request/response shape should be expanded to include survey settings.
- Frontend needs loading, error, validation, duplicate submit prevention, and optimistic or confirmed navigation behavior.

#### Seeing Survey

- Survey list/detail screens exist.
- Authenticated API wiring is missing.
- Backend should provide list/detail data in the exact frontend shape or the frontend should map API DTOs into UI types.
- Survey `shareUrl` must be generated consistently with the respondent route.

#### Responding to Survey

- Respondent UI exists.
- Public lookup by short id is missing on the backend.
- Real voice session creation is missing.
- Submission to `POST /surveys/{survey_id}/responses` is missing on the frontend.
- The backend currently assumes an existing ElevenLabs `conversation_id`; no endpoint creates/configures that conversation for a survey.

#### Seeing Responses and Details

- Response list and detail UI exist.
- Backend has processed response listing, but not the full detail contract.
- Backend needs a single-response detail endpoint or response list needs to include all drawer fields.
- Audio URL/asset handling is not modeled yet; current frontend audio player is simulated.

#### Mapping Themes

- Backend aggregates tags into theme counts.
- Frontend displays themes.
- No manual theme mapping exists yet: merge, rename, recolor, attach/detach response, or mark theme as hidden.
- Theme summaries and representative quotes are only mock data.

#### Updating Survey Questions

- Frontend displays questions and has an "edit questions" button.
- Backend stores questions.
- No edit UI flow, validation, reorder behavior, or backend mutation endpoint exists.
- Need a clear rule for live surveys: whether editing questions affects only future responses, creates a version, or is blocked after responses exist.

#### Updating Survey Settings

- Frontend settings controls exist but are local-only.
- Backend stores only survey `status`; it does not store response cap, language, follow-up depth, voice settings, or privacy settings.
- No `PATCH /surveys/{survey_id}/settings`, close, reopen, or delete endpoint exists.

## Proposed Functional Path

1. Creator signs in through Clerk and reaches the dashboard.
2. Frontend data layer requests creator-owned surveys with Clerk bearer token.
3. Creator creates a survey with title, description, questions, and initial settings.
4. Backend stores survey, questions, settings, owner id, and short public id.
5. Backend returns a `shareUrl` using `/s/{short_id}`.
6. Respondent opens `/s/{short_id}` without auth.
7. Frontend loads public survey info from backend by short id.
8. Frontend starts a voice session for that survey.
9. Respondent completes the voice conversation.
10. Frontend submits the resulting `conversation_id` and respondent metadata.
11. Backend creates a pending response, fetches transcript/audio metadata, extracts quote/tags/sentiment/summary, persists response detail, and updates themes.
12. Creator sees processed responses, response detail, themes, questions, and settings from authenticated backend endpoints.
13. Creator can update questions/settings through explicit mutation endpoints.

## Frontend-Backend Contract

### Ownership

Frontend owns:

- route structure and screen composition
- UI state, loading states, empty states, validation messages, and optimistic transitions
- Clerk session retrieval and attaching bearer tokens to authenticated API calls
- respondent microphone permission UX
- voice agent client adapter lifecycle
- mapping backend DTOs into view models if the API shape differs from UI types
- client-side form validation that improves UX, while treating backend validation as authoritative

Backend owns:

- authentication and ownership authorization for creator endpoints
- public short-id survey lookup for respondent pages
- durable survey, question, setting, response, transcript, and theme persistence
- survey status enforcement
- response cap enforcement
- live/draft/closed behavior
- voice-provider integration and server-trusted conversation handling
- response processing pipeline
- theme aggregation and manual theme mapping persistence
- authoritative validation and error responses

Shared contract owns:

- route paths
- request/response DTO names and field casing
- status enums
- processing state enums
- error shape
- versioning rules for questions and settings

### Auth Rules

Creator endpoints require Clerk bearer token:

- `GET /surveys`
- `POST /surveys`
- `GET /surveys/{survey_id}`
- `PATCH /surveys/{survey_id}`
- `DELETE /surveys/{survey_id}`
- `PUT /surveys/{survey_id}/questions`
- `PATCH /surveys/{survey_id}/settings`
- `GET /surveys/{survey_id}/responses`
- `GET /surveys/{survey_id}/responses/{response_id}`
- `GET /surveys/{survey_id}/themes`
- all theme mapping mutations

Public respondent endpoints do not require Clerk:

- `GET /public/surveys/{short_id}`
- `POST /public/surveys/{short_id}/voice-session`
- `POST /public/surveys/{short_id}/responses`

Public endpoints must return only respondent-safe survey data. They must not expose creator analytics, response counts if not wanted, internal UUIDs unless needed, or private settings.

### Error Shape

All backend errors should use this shape:

```json
{
  "error": {
    "code": "survey_not_found",
    "message": "Survey not found",
    "field": null
  }
}
```

Recommended common codes:

- `unauthorized`
- `forbidden`
- `validation_error`
- `survey_not_found`
- `survey_not_live`
- `response_cap_reached`
- `voice_session_failed`
- `response_not_found`
- `processing_not_ready`
- `conflict`

### Survey DTOs

#### `SurveySummary`

Used by `GET /surveys`.

```ts
type SurveyStatus = "live" | "draft" | "closed";

interface SurveySummary {
  id: string;
  title: string;
  description: string;
  status: SurveyStatus;
  responseCount: number;
  avgDuration: string;
  completionRate: string;
  createdAt: string;
  shareUrl: string;
}
```

#### `SurveyDetail`

Used by `GET /surveys/{survey_id}`.

```ts
interface SurveyDetail extends SurveySummary {
  questions: Question[];
  settings: SurveySettings;
}

interface Question {
  id: string;
  text: string;
  order: number;
  askedCount?: number;
  answeredCount?: number;
  avgFollowUps?: number;
  topTag?: string;
}
```

#### `PublicSurvey`

Used by `GET /public/surveys/{short_id}`.

```ts
interface PublicSurvey {
  id: string;
  shortId: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  status: "live" | "closed";
  questions: Array<{
    id: string;
    text: string;
    order: number;
  }>;
  respondentSettings: {
    language: string;
    allowAnonymous: boolean;
    privacyText?: string;
  };
}
```

### Survey Creation

`POST /surveys`

Authenticated.

Request:

```ts
interface CreateSurveyRequest {
  title: string;
  description?: string;
  status?: "draft" | "live";
  questions: Array<{
    text: string;
    order: number;
  }>;
  settings?: Partial<SurveySettings>;
}
```

Response: `SurveyDetail`

Frontend behavior:

- Validate non-empty title.
- Validate at least one non-empty question before publish.
- Disable duplicate submit while pending.
- On success, update local cache and navigate to `/surveys/{id}/published` if status is `live`, otherwise `/surveys/{id}`.

Backend behavior:

- Derive owner from Clerk token.
- Generate UUID `id`.
- Generate unique `shortId`.
- Store survey, questions, and settings transactionally.
- Return `shareUrl` as `${APP_URL}/s/${shortId}`.

### Survey Detail and List

`GET /surveys`

Authenticated. Returns `SurveySummary[]`.

`GET /surveys/{survey_id}`

Authenticated. Returns `SurveyDetail`.

Backend must enforce ownership on both endpoints.

### Public Survey Lookup

`GET /public/surveys/{short_id}`

Public. Returns `PublicSurvey`.

Backend behavior:

- Look up by `short_id`.
- Return 404 if not found.
- Return respondent-safe closed state if survey is closed.
- Do not expose creator-only analytics.

Frontend behavior:

- `/s/[slug]` calls this endpoint.
- If closed, show a closed-survey state instead of starting voice flow.
- If not found, show "survey not found."

### Voice Session

`POST /public/surveys/{short_id}/voice-session`

Public.

Request:

```ts
interface CreateVoiceSessionRequest {
  respondentName?: string;
  respondentRole?: string;
  isAnonymous?: boolean;
}
```

Response:

```ts
interface VoiceSessionStart {
  provider: "elevenlabs";
  conversationId: string;
  clientSecret?: string;
  signedUrl?: string;
  expiresAt: string;
}
```

Frontend behavior:

- Request microphone permission before or during session start.
- Initialize the real voice adapter from this response.
- Keep `conversationId` in memory for final submission.

Backend behavior:

- Validate survey exists and is live.
- Enforce response cap before creating session.
- Configure the voice provider with survey questions/settings.
- Return only the client-safe connection data.

### Response Submission

Recommended public route:

`POST /public/surveys/{short_id}/responses`

Request:

```ts
interface SubmitResponseRequest {
  conversationId: string;
  respondentName?: string;
  respondentRole?: string;
  isAnonymous: boolean;
}
```

Response:

```ts
interface SubmitResponseAck {
  id: string;
  status: "pending" | "processing";
}
```

Backend behavior:

- Validate survey exists and is live.
- Verify the conversation belongs to the survey/session when provider support allows it.
- Create response row.
- Queue processing.
- Return quickly with 202.

Frontend behavior:

- Submit when respondent confirms ending.
- Show thank-you state after a successful ack.
- If submit fails, show retry without losing `conversationId`.

### Response List and Detail

`GET /surveys/{survey_id}/responses`

Authenticated. Returns `ResponseSummary[]`.

```ts
type Sentiment = "delighted" | "neutral" | "frustrated";
type ProcessingStatus = "pending" | "processing" | "done" | "failed";

interface ResponseSummary {
  id: string;
  surveyId: string;
  respondentName: string;
  respondentRole: string;
  isAnonymous: boolean;
  quote: string;
  duration: string;
  durationSeconds: number;
  tags: string[];
  sentiment: Sentiment;
  processingStatus: ProcessingStatus;
  createdAt: string;
}
```

`GET /surveys/{survey_id}/responses/{response_id}`

Authenticated. Returns `ResponseDetail`.

```ts
interface TranscriptSegment {
  t: string;
  who: "koel" | "them";
  text: string;
  highlight?: boolean;
}

interface ResponseDetail extends ResponseSummary {
  transcript: TranscriptSegment[];
  koelSummary: string;
  audioUrl?: string;
}
```

Backend behavior:

- Enforce survey ownership.
- Return only creator-owned responses.
- Return 409 or 202-style status if processing is not done, depending on UI needs.

Frontend behavior:

- Use list data for cards.
- Fetch detail on drawer open unless list already includes all detail fields.
- Render pending/failed states instead of assuming all responses are done.

### Themes

`GET /surveys/{survey_id}/themes`

Authenticated. Returns `Theme[]`.

```ts
interface Theme {
  id: string;
  name: string;
  count: number;
  color: string;
  summary?: string;
  quotes?: Array<{
    q: string;
    who: string;
    responseId: string;
  }>;
}
```

Manual mapping endpoints:

- `PATCH /surveys/{survey_id}/themes/{theme_id}` to rename, recolor, or hide a theme.
- `POST /surveys/{survey_id}/themes/merge` to merge themes.
- `POST /surveys/{survey_id}/responses/{response_id}/themes` to attach a theme to a response.
- `DELETE /surveys/{survey_id}/responses/{response_id}/themes/{theme_id}` to detach a theme from a response.

Backend behavior:

- Store generated tags separately from manually curated theme mappings.
- Preserve manual edits when new responses are processed.
- Recompute counts from mappings or maintain counts transactionally.

Frontend behavior:

- Show generated themes by default.
- Add edit controls only after endpoints exist.
- Refresh themes after mutations.

### Questions

`PUT /surveys/{survey_id}/questions`

Authenticated.

Request:

```ts
interface ReplaceQuestionsRequest {
  versionStrategy: "future_only" | "new_version";
  questions: Array<{
    id?: string;
    text: string;
    order: number;
  }>;
}
```

Response: `Question[]`

Recommended rule:

- Draft surveys can freely replace questions.
- Live surveys with zero responses can replace questions.
- Live surveys with responses should use `future_only` or create a new survey version. Existing responses must remain tied to the question text they answered.

Backend behavior:

- Enforce ownership.
- Validate at least one question.
- Persist ordering.
- Preserve historical response integrity.

Frontend behavior:

- Provide edit mode with add/remove/reorder.
- Show warning when editing a live survey with responses.
- Disable save while pending and refresh detail on success.

### Settings

```ts
interface SurveySettings {
  responseCap: number | null;
  language: string;
  followUpDepth: 1 | 2 | 3;
  allowAnonymous: boolean;
  collectRespondentName: boolean;
  transcriptEmailOptIn: boolean;
  closeOnResponseCap: boolean;
}
```

`PATCH /surveys/{survey_id}/settings`

Authenticated. Partial update.

Request: `Partial<SurveySettings> & { status?: SurveyStatus }`

Response: `SurveyDetail`

Additional endpoints:

- `POST /surveys/{survey_id}/close`
- `POST /surveys/{survey_id}/reopen`
- `DELETE /surveys/{survey_id}`

Backend behavior:

- Enforce ownership.
- Validate language and follow-up depth.
- Enforce response cap during voice session creation and response submission.
- Delete should cascade to questions, responses, and themes or soft-delete based on product policy.

Frontend behavior:

- Settings tab should initialize from backend settings.
- Save changes explicitly or autosave with clear pending/error state.
- Close/delete actions need confirmation.

## Recommended Implementation Order

1. Align route and DTO contract first: `/s/{short_id}`, `GET /public/surveys/{short_id}`, and authenticated `apiFetch` with Clerk token.
2. Wire survey creation to `POST /surveys`.
3. Add survey settings to the database/schema/API and return them with survey detail.
4. Add `PATCH /surveys/{survey_id}/settings` and wire the settings tab.
5. Add `PUT /surveys/{survey_id}/questions` and wire the questions edit flow.
6. Implement real public respondent lookup and closed/not-found states.
7. Implement voice session creation and response submission from the respondent UI.
8. Expand response persistence and API shape for `durationSeconds`, `sentiment`, structured transcript, and `koelSummary`.
9. Protect response/theme creator endpoints with Clerk ownership checks.
10. Add response detail endpoint and wire drawer fetch/error/pending states.
11. Expand themes from tag counts to curated theme mapping with summaries and representative quotes.

## Immediate Contract Fixes Before Coding Features

- Change backend share URL generation from `/r/{short_id}` to `/s/{short_id}`.
- Add `GET /public/surveys/{short_id}` instead of relying on `GET /surveys/share/{slug}`.
- Update frontend `getSurveyBySlug` to call the public endpoint.
- Update frontend `apiFetch` to attach Clerk tokens for authenticated dashboard calls.
- Decide whether the frontend UI types remain the canonical shape or whether separate API DTOs are introduced with mapping functions.
- Expand backend `ResponseOut` or add `ResponseDetailOut` so the response drawer can work against real API data.
- Persist `summary`, `sentiment`, `duration_seconds`, and structured transcript data.
- Move creator response/theme endpoints behind auth and ownership checks before using real customer data.
