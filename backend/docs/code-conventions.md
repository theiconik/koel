# Code Conventions

## File & Folder Structure

```
auth/             Clerk JWT verification and FastAPI auth dependencies
config/           settings, logging, tracing, prompt/runtime configuration
db/               Supabase client, Pydantic schemas, SQL migrations
routers/          FastAPI route modules grouped by API surface
services/         integrations and domain services used by routers/workers
scripts/          operational CLIs, including durable response worker
tests/            pytest suite with service/API behavior tests and fakes
docs/             backend-specific setup, architecture, and operations docs
```

## Routing

- Routers own HTTP shape, auth checks, and status-code mapping. Keep database-heavy orchestration in services or Postgres RPCs when it needs transactionality.
- Protected creator routes use `Depends(get_current_user)` and must verify survey ownership before returning survey-scoped data.
- Public survey routes must enforce survey status, response caps, and collection policy through the atomic public submission RPC.
- Use `HTTPException` for expected API errors. Keep details stable and user-safe.

## Settings and Environment

- All environment variables live in `config/settings.py` and are documented in `.env.example`.
- Import `settings` instead of reading `os.environ` directly in app code.
- Keep defaults local-dev safe. Production-only hardening, such as `CLERK_JWT_AUDIENCE`, should be documented and optional only when local tooling needs it.
- Do not commit real values for Supabase, Clerk, ElevenLabs, OpenRouter, Gemini, or OTLP headers.

## Database and Transactions

- Use Supabase client calls for simple single-table reads and writes.
- Use SQL migrations/RPCs for multi-step writes, concurrency-sensitive checks, or durable state transitions.
- Response submission, response cap enforcement, retry, survey creation, draft question replacement, theme increments, and chunk replacement are database-side operations.
- Migrations are applied manually in order from `backend/db/migrations`. New migrations must be idempotent when practical and should not rewrite older migration history.

## Background Processing

- Do not use FastAPI `BackgroundTasks` for response processing. Long-running response work belongs to `scripts/process_response_jobs.py`.
- The worker claims `response_processing_jobs` with leased database locks and finishes jobs through `finish_response_processing_job`.
- `process_response()` returns typed outcomes: `done`, `retry`, or `failed`. Recoverable outcomes requeue with exponential backoff; terminal failures become manually retryable.
- Keep response processing idempotent enough for lease expiry and retries. Avoid non-atomic client-side counters.

## Logging and Tracing

- Every HTTP response must include `X-Request-ID`. The backend accepts a safe incoming value and generates one when absent. Do not read or log raw request headers to get this id; use the request context middleware in `main.py`.
- `LOG_FORMAT=json` emits structured JSON logs with `request_id`, `trace_id`, `span_id`, and safe context fields such as `job_id`, `response_id`, `survey_id`, `worker_id`, `status_code`, `method`, and `path` when available. Text logs include compact `req=` and `trace=` prefixes.
- Prefer context fields over embedding identifiers in every message. Request context is set by middleware; durable response jobs bind `job_id`, `response_id`, and `survey_id` at the job boundary.
- Never log secrets, auth tokens, cookies, raw headers, signed URLs, API response bodies, full request/response bodies, transcripts, prompts, or uploaded/audio content. Status codes, stable internal ids, counts, and high-level error categories are acceptable.
- Use `logger.exception(...)` inside `except` blocks when the stack trace is useful to diagnose an unexpected failure. Use `logger.warning(...)` or `logger.error(...)` without `exc_info` for expected external failures where the type/status is enough.
- When handling an exception that should appear in traces, call `config.tracing.record_exception(exc)` or `mark_error(...)`. Add non-sensitive span attributes with `set_current_span_attributes(...)` or `start_span(..., attributes={...})`.
- OpenTelemetry is opt-in through env settings: `OTEL_ENABLED`, `OTEL_SERVICE_NAME`, `OTEL_EXPORTER_OTLP_ENDPOINT`, `OTEL_EXPORTER_OTLP_HEADERS`, and `OTEL_TRACES_SAMPLE_RATE`. The app and worker must remain importable when OpenTelemetry packages are not installed.

## HTTP Responses

- New routers should rely on the middleware-wide request id instead of generating their own. If a route builds a custom `Response`, preserve the middleware-provided `X-Request-ID` header.
- Error responses should expose stable, user-safe details. Put diagnostic context in structured logs and traces rather than response bodies.

## External Services

- ElevenLabs, OpenRouter, Gemini, Clerk, and Supabase calls must not log raw response bodies, prompts, transcripts, auth headers, or signed URLs.
- Treat provider `429` and `5xx` failures as recoverable when processing a response. Treat missing resources and explicitly failed conversations as terminal.
- Keep provider fallback behavior in service modules, not routers.

## Tests

- Backend tests live under `tests/` and run with `venv/bin/python -m pytest` from `backend/`.
- Tests must not call live Supabase, Clerk, ElevenLabs, OpenRouter, Gemini, or OTLP endpoints.
- Prefer behavior tests with monkeypatched services and fakes over import-only or implementation-mirror tests.
- Add regression tests for retry semantics, status-code mapping, ownership/policy checks, and atomic helper behavior when changing those paths.
