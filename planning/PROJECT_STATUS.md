# Koel Project Status

Date: 2026-04-27

## Summary

Koel is now stitched into a working V1 survey workflow across the mock-first Next.js frontend and FastAPI backend. The application supports creator-owned survey creation/list/detail, public respondent links at `/s/{short_id}`, signed ElevenLabs voice sessions, response submission, transcript processing, LLM enrichment, generated themes, editable questions, persisted settings, and a survey-scoped insights chat backed by response embeddings.

Real API mode no longer silently falls back to mock data. Mock data is used only when `NEXT_PUBLIC_USE_MOCK !== "false"`.

## Current Architecture

### Frontend

- App: Next.js App Router in `frontend/`
- Auth: Clerk via `@clerk/nextjs`
- Voice SDK: `@elevenlabs/react`
- Data boundary: `frontend/lib/data/index.ts`
- Voice adapter boundary: `frontend/lib/voice/agent.ts`
- Insights chat: `frontend/app/(dashboard)/insights/page.tsx`
- Main route groups:
  - Dashboard: `frontend/app/(dashboard)`
  - Respondent: `frontend/app/(respondent)/s/[slug]`
  - Auth: `frontend/app/(auth)`

### Backend

- App: FastAPI in `backend/main.py`
- Auth: Clerk JWT verification in `backend/auth/clerk.py`
- Database: Supabase via service role client in `backend/db/client.py`
- Routers:
  - `backend/routers/surveys.py`
  - `backend/routers/responses.py`
  - `backend/routers/stats.py`
  - `backend/routers/insights.py`
- Services:
  - ElevenLabs signed sessions and transcript fetch: `backend/services/elevenlabs.py`
  - OpenRouter insight extraction: `backend/services/llm.py`
  - Response processing pipeline: `backend/services/processing.py`
  - Response chunk indexing and RAG retrieval: `backend/services/response_index.py`
  - Survey insights routing/answer orchestration: `backend/services/insights_chat.py`
- Migrations:
  - `backend/db/migrations/001_init.sql`
  - `backend/db/migrations/002_v1_workflow.sql`
  - `backend/db/migrations/003_insights_rag.sql`

## Implemented Workflow

1. Creator signs in with Clerk.
2. Frontend attaches Clerk bearer tokens for authenticated backend calls.
3. Creator creates a survey through `POST /surveys`.
4. Backend stores survey, questions, settings, owner id, and generated `short_id`.
5. Backend returns share links as `{APP_URL}/s/{short_id}`.
6. Respondent opens `/s/{short_id}` without auth.
7. Frontend loads public survey data from `GET /surveys/share/{short_id}`.
8. Frontend starts a voice session through `POST /surveys/share/{short_id}/voice-session`.
9. Backend validates survey status/cap and returns an ElevenLabs signed URL.
10. Frontend starts ElevenLabs browser session with `@elevenlabs/react`.
11. Frontend submits the resulting `conversation_id` to `POST /surveys/share/{short_id}/responses`.
12. Backend creates a pending response and starts async processing.
13. Processing polls ElevenLabs until transcript data is ready, persists transcript/duration, then calls OpenRouter for quote/tags/summary/sentiment.
14. If OpenRouter fails or rate-limits, transcript/duration still remain available with a fallback summary and processing error.
15. Processed responses are indexed into pgvector chunks using Gemini `gemini-embedding-001`.
16. Creator sees responses, transcript details, themes, questions, settings, and survey-scoped insights chat in the dashboard.

## Backend API Surface

### Creator Authenticated

- `GET /surveys`
- `POST /surveys`
- `GET /surveys/{survey_id}`
- `PATCH /surveys/{survey_id}`
- `PUT /surveys/{survey_id}/questions`
- `GET /surveys/{survey_id}/responses`
- `POST /surveys/{survey_id}/responses/{response_id}/retry`
- `GET /surveys/{survey_id}/themes`
- `POST /surveys/{survey_id}/insights/chat`
- `GET /stats`

All creator endpoints require Clerk auth and enforce survey ownership.

### Public Respondent

- `GET /surveys/share/{short_id}`
- `POST /surveys/share/{short_id}/voice-session`
- `POST /surveys/share/{short_id}/responses`

Public endpoints expose only respondent-safe survey/session/submission data.

## Persisted Data

### Surveys

- title
- description
- status: `live`, `draft`, `closed`
- public `short_id`
- response cap
- language
- follow-up depth
- respondent name collection preference
- anonymous response preference
- transcript email preference
- close-on-cap preference

### Questions

- text
- order
- active flag

Live survey question edits preserve historical integrity by deactivating replaced/removed questions and inserting new active rows.

### Responses

- conversation id
- respondent metadata
- anonymous flag
- raw transcript
- structured transcript JSON
- quote
- summary
- sentiment
- tags
- duration seconds
- processing status: `pending`, `processing`, `done`, `failed`
- processing error

### Themes

- name
- count
- color
- optional summary
- optional representative quotes

Current theme generation is reliable-first tag aggregation from response insights.

## Environment

### Backend `.env`

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

CLERK_ISSUER=https://your-clerk-domain.clerk.accounts.dev

ELEVENLABS_API_KEY=your-elevenlabs-api-key
ELEVENLABS_AGENT_ID=agent_xxxxxxxxxxxxxxxxxxxxx
ELEVENLABS_BRANCH_ID=
ELEVENLABS_ENVIRONMENT=production

OPENROUTER_API_KEY=your-openrouter-api-key
OPENROUTER_MODEL=openai/gpt-4o-mini
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash
GEMINI_EMBEDDING_MODEL=gemini-embedding-001
GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/

APP_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000

LOG_LEVEL=INFO
LOG_FORMAT=text
```

### Frontend `.env.local`

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_USE_MOCK=false
```

ElevenLabs secrets and agent id stay on the backend for signed sessions.

## ElevenLabs Agent Setup

The backend creates a signed session URL using `ELEVENLABS_AGENT_ID`.

The frontend passes dynamic variables to the ElevenLabs session:

- `survey_id`
- `survey_title`
- `survey_description`
- `survey_questions`
- `language`
- `follow_up_depth`
- `collect_respondent_name`
- `allow_anonymous_responses`

The ElevenLabs agent prompt should reference these variables directly, for example `{{survey_questions}}`.

Koel currently uses the agent's default system prompt and first message configured in ElevenLabs. The app does not override prompt or first message at session start.

## Insights Chat / RAG

The insights chat is survey-scoped. It first routes questions with deterministic rules:

- structured analytics for counts, percentages, sentiment breakdowns, and top tags
- RAG for qualitative "what/why/summarize" questions
- hybrid for questions that need both, such as "how many were positive and why?"

If the rule router is uncertain, it falls back to an LLM classifier that chooses only the tool path. Final answers are generated from database counts and/or retrieved response chunks, not from classifier output.

Response chunks are written after transcript processing succeeds. If a survey has no responses, the chat returns "No responses for this survey yet." If responses exist but no chunks have been indexed, it returns "The responses have not been indexed yet. Please try again after some time."

## Known Limitations

- Audio playback in the response drawer is still simulated; no real audio URL is persisted or played.
- Transcript download button is UI-only.
- Manual tag editing is UI-only.
- Theme summaries and representative quotes are not deeply generated yet; tag counts are the reliable V1 path.
- Response processing runs in FastAPI `BackgroundTasks`; a production queue would be more durable.
- Existing responses created before migration `003_insights_rag.sql` need a backfill/retry path before they appear in insights chat retrieval.
- OpenRouter free/upstream models may rate-limit. When this happens, transcript still persists and a retry button is available.
- Email transcript preference is stored but email sending is not implemented.
- Delete survey UI exists, but destructive backend deletion is not wired.
- Existing failed responses may need the retry endpoint after restarting the backend with the latest processing changes.

## Verification Commands

Frontend:

```bash
cd frontend
npm run typecheck
npm run lint
npm run build
```

Backend syntax check:

```bash
python3 -m py_compile \
  backend/main.py \
  backend/routers/surveys.py \
  backend/routers/responses.py \
  backend/routers/stats.py \
  backend/services/processing.py \
  backend/services/elevenlabs.py \
  backend/services/embeddings.py \
  backend/services/response_index.py \
  backend/services/insights_chat.py \
  backend/services/llm.py \
  backend/routers/insights.py \
  backend/db/schemas.py \
  backend/config/settings.py \
  backend/config/processing.py
```

Current verification status:

- Frontend typecheck passes.
- Frontend lint passes with two pre-existing `<img>` warnings in `frontend/app/page.tsx`.
- Frontend production build passes.
- Backend Python compile passes.

## Suggested Next Steps

1. Add real audio URL persistence/playback if ElevenLabs exposes retrievable audio for completed conversations.
2. Move response processing from `BackgroundTasks` to a durable job queue.
3. Add a manual "retry processing" control to response list cards, not only the drawer.
4. Implement transcript download.
5. Implement delete survey with explicit confirmation.
6. Add focused backend tests for ownership, public lookup, response cap rejection, and retry processing.
7. Add frontend integration tests for real-mode loading/error/retry states.
