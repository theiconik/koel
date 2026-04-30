# Response processing worker

Response submission endpoints do not process ElevenLabs transcripts or LLM
enrichment in the FastAPI request process. They create a response and enqueue a
durable `response_processing_jobs` row through the
`create_response_with_processing_job` database function, then return `202`.

## Setup

Apply the database migrations in order:

```sql
backend/db/migrations/001_init.sql
backend/db/migrations/002_v1_workflow.sql
backend/db/migrations/003_insights_rag.sql
backend/db/migrations/004_response_processing_jobs.sql
backend/db/migrations/005_public_response_cap_submit.sql
backend/db/migrations/006_idempotent_response_retry.sql
backend/db/migrations/007_atomic_theme_increments.sql
backend/db/migrations/008_atomic_draft_question_replacement.sql
backend/db/migrations/009_atomic_survey_creation.sql
backend/db/migrations/010_atomic_response_chunk_replacement.sql
backend/db/migrations/011_response_processing_retry_recovery.sql
```

The worker uses the same backend environment variables as the API, plus these
optional defaults:

```env
RESPONSE_JOB_BATCH_SIZE=1
RESPONSE_JOB_LEASE_SECONDS=900
RESPONSE_JOB_POLL_INTERVAL_SECONDS=5
RESPONSE_JOB_RETRY_DELAY_SECONDS=60
RESPONSE_JOB_RETRY_MAX_DELAY_SECONDS=900
```

## Run

Run at least one worker process anywhere that can reach Supabase, ElevenLabs,
OpenRouter, and Gemini:

```bash
cd backend
venv/bin/python scripts/process_response_jobs.py
```

For one-shot processing, useful in cron-style deployments:

```bash
cd backend
venv/bin/python scripts/process_response_jobs.py --once
```

Multiple workers are safe. Jobs are claimed with a Postgres `FOR UPDATE SKIP
LOCKED` function and a lease. If a worker dies while processing, another worker
can claim the job after `RESPONSE_JOB_LEASE_SECONDS`.

## Retry and failure semantics

The existing `POST /surveys/{survey_id}/responses/{response_id}/retry` endpoint
only accepts responses whose `processing_status` is `failed`. The database RPC
locks the response row before changing it back to `pending`, so double-clicks
and races do not reset done rows or create duplicate queued work.

The worker distinguishes three processing outcomes:

- `done`: transcript, LLM enrichment, response persistence, and retrieval
  indexing completed. The job is marked `succeeded` and the response is `done`.
- `retry`: the failure is likely recoverable. Examples include transcript not
  being ready after polling, ElevenLabs 429/5xx responses, temporary database
  failures, LLM provider failures after provider fallback, and retrieval-index
  persistence failures. The job is requeued with exponential backoff using
  `RESPONSE_JOB_RETRY_DELAY_SECONDS` as the base delay and
  `RESPONSE_JOB_RETRY_MAX_DELAY_SECONDS` as the cap. The response remains
  user-visible as `pending` with `processing_error` set to the latest safe
  failure message.
- `failed`: the failure is terminal. Examples include a missing conversation id,
  an explicitly failed ElevenLabs conversation, a missing ElevenLabs
  conversation, or a completed ElevenLabs conversation with an empty transcript.
  The job is marked `failed` and the response becomes manually retryable.

Automatic retries stop when the job reaches `max_attempts`; at that point the
job and response are marked `failed`. Manual retry policy is unchanged: only
responses whose `processing_status` is `failed` can be manually retried.

## Observability

Each worker process binds `worker_id` in log context. Each claimed job binds
`job_id`, `response_id`, `survey_id`, `attempt`, and `max_attempts`. With
`LOG_FORMAT=json`, those fields are emitted as structured log fields. With
`OTEL_ENABLED=true`, each job runs inside a `response_job.process` span with
matching non-sensitive attributes.

Keep worker logs payload-safe. Do not log transcripts, prompts, signed URLs,
provider response bodies, API keys, or raw headers.

## Deployment Checklist

- Apply migrations `001` through `011` in order.
- Run at least one worker process wherever it can reach Supabase and providers.
- Set `RESPONSE_JOB_LEASE_SECONDS` longer than the expected maximum processing
  time for one response.
- Set `RESPONSE_JOB_RETRY_DELAY_SECONDS` and
  `RESPONSE_JOB_RETRY_MAX_DELAY_SECONDS` to avoid hot loops during provider
  outages.
- Configure log collection for stdout. Prefer `LOG_FORMAT=json` in production.
- Enable OpenTelemetry with an OTLP collector when distributed traces are
  available.
