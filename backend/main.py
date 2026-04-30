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
from config.log_context import (
    X_REQUEST_ID_HEADER,
    bind_log_context,
    get_log_context,
    request_id_from_header,
    reset_log_context,
)
from config.tracing import configure_tracing, set_current_span_attributes, shutdown_tracing
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
    try:
        yield
    finally:
        shutdown_tracing()


app = FastAPI(
    title="koel API",
    version="1.0.0",
    description="AI voice-powered survey platform",
    lifespan=lifespan,
)
configure_tracing(settings, app=app)

# ─── CORS ────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=[X_REQUEST_ID_HEADER],
)

# ─── routers ─────────────────────────────────────────────────────────────────
app.include_router(surveys.router)
app.include_router(responses.router)
app.include_router(insights.router)
app.include_router(stats.router)


# ─── request correlation ─────────────────────────────────────────────────────
@app.middleware("http")
async def request_correlation_middleware(request: Request, call_next):
    request_id = request_id_from_header(request.headers.get(X_REQUEST_ID_HEADER))
    token = bind_log_context(
        request_id=request_id,
        method=request.method,
        path=request.url.path,
    )
    set_current_span_attributes({"request.id": request_id})
    try:
        response = await call_next(request)
    except Exception:
        logger.exception("Unhandled request error on %s", request.url.path)
        response = JSONResponse(
            status_code=500,
            content={"detail": "Internal server error"},
        )
    else:
        logger.debug(
            "Request completed",
            extra={
                "request_id": request_id,
                "method": request.method,
                "path": request.url.path,
                "status_code": response.status_code,
            },
        )
    finally:
        reset_log_context(token)

    response.headers[X_REQUEST_ID_HEADER] = request_id
    return response


# ─── error handling ───────────────────────────────────────────────────────────
@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled request error on %s", request.url.path)
    request_id = get_log_context().get("request_id")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
        headers={X_REQUEST_ID_HEADER: request_id} if request_id else None,
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
