# Building and Running the Backend

## Runtime

The backend is a FastAPI application backed by Supabase, Clerk, ElevenLabs,
OpenRouter, and Gemini. It is designed to run as an API process plus a separate
durable response-processing worker.

## Setup

From the repository root:

```bash
cd backend
python -m venv venv
venv/bin/python -m pip install -r requirements.txt
cp .env.example .env
```

Fill in `.env` values for Supabase, Clerk, ElevenLabs, OpenRouter, and Gemini.
Local test runs do not need real secrets, but the running API and worker do.

## Database

Apply migrations manually in Supabase SQL editor in order:

```text
001_init.sql
002_v1_workflow.sql
003_insights_rag.sql
004_response_processing_jobs.sql
005_public_response_cap_submit.sql
006_idempotent_response_retry.sql
007_atomic_theme_increments.sql
008_atomic_draft_question_replacement.sql
009_atomic_survey_creation.sql
010_atomic_response_chunk_replacement.sql
011_response_processing_retry_recovery.sql
```

The later migrations add durable jobs and RPCs for atomic response submission,
retry, theme increments, survey creation, question replacement, response chunk
replacement, and automatic retry recovery.

## API Server

```bash
cd backend
venv/bin/uvicorn main:app --reload --port 8000
```

Every response includes `X-Request-ID`. In production, prefer:

```env
LOG_FORMAT=json
CLERK_JWT_AUDIENCE=koel-api
CLERK_AUTHORIZED_PARTIES=https://your-frontend-origin.example
```

## Worker

The API no longer processes submitted responses in request-process background
tasks. Run the durable worker separately:

```bash
cd backend
venv/bin/python scripts/process_response_jobs.py
```

See `response-processing-worker.md` for retry, lease, and deployment details.

## Tracing

OpenTelemetry is disabled by default. For local console spans:

```env
OTEL_ENABLED=true
OTEL_EXPORTER_OTLP_ENDPOINT=
```

For OTLP HTTP export:

```env
OTEL_ENABLED=true
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
```

`OTEL_EXPORTER_OTLP_HEADERS` supports comma-separated `key=value` pairs for
collector auth. Do not commit real header values.
