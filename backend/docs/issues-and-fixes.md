# Issues and Fixes

## Backend reliability remediation

The backend review identified several production-correctness risks. The current
implementation addresses them as follows:

| Issue | Fix |
| --- | --- |
| In-process response processing could be lost after `202` | Response submission now enqueues `response_processing_jobs`; `scripts/process_response_jobs.py` performs durable work. |
| Public response caps could race | `create_public_response_with_processing_job` locks the survey row and checks cap/insert/closes atomically. |
| Manual retry could duplicate processing | Retry is restricted to failed responses and guarded by `requeue_response_processing_job`. |
| Public anonymity/name policy could be bypassed | Public submission RPC enforces `allow_anonymous_responses` and `collect_respondent_name` before insert. |
| Theme counts used read-modify-write | `increment_survey_themes` performs atomic `INSERT ... ON CONFLICT DO UPDATE`. |
| Draft question replacement deleted then inserted | `replace_draft_survey_questions` performs replacement in one transaction. |
| Survey creation inserted survey then questions separately | `create_survey_with_questions` creates both in one transaction. |
| Sync Supabase calls blocked survey async routes | Survey routes that only do sync DB work are plain `def`; the async voice-session route offloads DB work to a threadpool. |
| Clerk JWT audience was not checked | `CLERK_JWT_AUDIENCE` verifies `aud`; `CLERK_AUTHORIZED_PARTIES` can verify `azp`. |
| Response chunk rebuild deleted before insert | `replace_response_chunks` deletes and inserts chunks in one transaction after embeddings are ready. |

## Error recovery

`process_response()` returns typed outcomes:

- `done`: response is enriched, indexed, and finalized.
- `retry`: likely recoverable failure; worker requeues with exponential backoff.
- `failed`: terminal failure; response becomes manually retryable.

Recoverable failures include transcript not ready, provider `429`/`5xx`, LLM
provider failure, temporary DB persistence failures, and indexing failures.
Terminal failures include missing conversation id, missing/failed ElevenLabs
conversation, and completed empty transcript.

## Observability

- `X-Request-ID` is generated or propagated on every HTTP response.
- JSON logs include request/job/response/survey/trace context.
- OpenTelemetry is opt-in and supports console or OTLP HTTP export.
- Worker jobs run inside `response_job.process` spans when tracing is enabled.

## Remaining gaps

- Migrations must be applied in Supabase before deploying the code paths that
  call new RPCs.
- There is no live test database harness yet. Current tests use fakes and
  monkeypatches to exercise API/service behavior without network calls.
- Some routers outside `surveys.py` still use synchronous Supabase calls inside
  async route handlers; those should move to sync handlers, threadpool wrappers,
  or an async database client in a future pass.
