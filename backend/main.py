"""
koel FastAPI backend — entry point.

Run locally:
  cd backend
  uvicorn main:app --reload --port 8000

Environment:
  Copy .env.example → .env and fill in values.
  pydantic-settings reads .env automatically — no extra setup needed.
"""

# config.settings must be the first import so all os.environ reads
# are satisfied before any other module touches them.
from config.settings import settings  # noqa: E402
from config.logging_config import configure_logging

configure_logging(level=settings.log_level, fmt=settings.log_format)  # type: ignore[arg-type]

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from auth.clerk import refresh_jwks
from routers import surveys, responses, stats

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Pre-fetch Clerk JWKS so the first request doesn't pay the latency cost
    try:
        await refresh_jwks()
        logger.info("Clerk JWKS loaded")
    except Exception as exc:
        logger.warning("Could not prefetch Clerk JWKS at startup: %s", exc)
    yield


app = FastAPI(
    title="koel API",
    version="1.0.0",
    description="AI voice-powered survey platform",
    lifespan=lifespan,
)

# ─── CORS ────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── routers ─────────────────────────────────────────────────────────────────
app.include_router(surveys.router)
app.include_router(responses.router)
app.include_router(stats.router)


# ─── health check ────────────────────────────────────────────────────────────
@app.get("/health", tags=["meta"])
async def health():
    return {"status": "ok"}
