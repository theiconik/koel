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

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from auth.clerk import refresh_jwks
from routers import insights, surveys, responses, stats

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
app.include_router(insights.router)
app.include_router(stats.router)


# ─── error handling ───────────────────────────────────────────────────────────
@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled request error on %s", request.url.path)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


# ─── health check ────────────────────────────────────────────────────────────
@app.get("/health", tags=["meta"])
async def health():
    return {
        "status": "ok",
        "corsOrigins": settings.cors_origins_list,
    }


@app.get("/debug/cors", tags=["meta"])
async def debug_cors(request: Request):
    return {
        "origin": request.headers.get("origin"),
        "corsOrigins": settings.cors_origins_list,
    }
