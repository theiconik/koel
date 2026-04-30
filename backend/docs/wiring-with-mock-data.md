# Wiring with Mock Data

The backend does not have a runtime mock-data mode. Runtime API and worker
processes use Supabase and configured providers from `.env`.

For tests, mock behavior lives in `backend/tests`:

- `tests/conftest.py` sets dummy environment variables before app imports.
- `tests/fakes.py` provides a small Supabase-style fluent query fake.
- Tests monkeypatch provider calls such as ElevenLabs, LLM extraction, indexing,
  response-job RPC helpers, and auth dependencies.

## When adding tests

- Do not add a global backend `USE_MOCK` runtime switch.
- Patch the specific integration boundary being tested.
- Keep fakes small and behavior-oriented. They should model only the query/RPC
  behavior needed by the test.
- Do not call live Supabase, Clerk, ElevenLabs, OpenRouter, Gemini, or OTLP
  endpoints from tests.

## Frontend mock mode

The frontend owns UI mock mode through `NEXT_PUBLIC_USE_MOCK`. Backend API
behavior should be tested with pytest fakes instead of serving mock responses
from production routes.
