# Running Backend Tests

The backend test suite uses `pytest` and does not require live Supabase, Clerk,
ElevenLabs, OpenRouter, Gemini, or other network services. Tests monkeypatch
external service calls and use small fakes for Supabase-style query chains.

From the backend directory:

```bash
cd backend
venv/bin/python -m pytest
```

To generate the SonarQube coverage report:

```bash
venv/bin/python -m pytest --cov --cov-report=xml:coverage.xml
```

The suite sets dummy environment variables in `tests/conftest.py` before
importing application modules, so a real `.env` file is not required to run
tests.

To run one file:

```bash
venv/bin/python -m pytest tests/test_processing.py
```

Required test dependency:

- `pytest>=8.0.0`
- `pytest-cov>=6.0.0`

## Current Coverage

- `tests/test_processing.py` covers response processing outcomes, including
  recoverable transcript readiness, terminal missing conversation id, LLM
  failures, and happy-path indexing before `done`.
- `tests/test_process_response_jobs.py` covers worker finish behavior,
  exponential backoff, retry/fail/succeeded job states, and swallowed
  job-finalization database errors.
- `tests/test_api_behavior.py` covers request id propagation/generation,
  public submission rejection mapping, retry endpoint status guards, and helper
  validation.

## Test Rules

- Do not require real `.env` secrets. `tests/conftest.py` sets dummy values
  before application modules import `settings`.
- Do not make network calls. Patch provider calls or use small fakes.
- Prefer tests that assert externally meaningful behavior: status codes,
  response state transitions, retry flags, backoff values, and safe error
  details.
- When changing an RPC-backed flow, test the Python/API contract and add SQL
  review notes in the migration or operational docs when a live database test is
  not available.
