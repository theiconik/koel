"""Request and job correlation context for logs and traces."""

from __future__ import annotations

from contextvars import Token
from contextvars import ContextVar
from uuid import uuid4

X_REQUEST_ID_HEADER = "X-Request-ID"

_log_context: ContextVar[dict[str, str]] = ContextVar("log_context", default={})


def get_log_context() -> dict[str, str]:
    """Return the current log correlation context."""
    return dict(_log_context.get())


def bind_log_context(**values: object) -> Token[dict[str, str]]:
    """Merge non-empty stringable values into the current log context."""
    current = dict(_log_context.get())
    for key, value in values.items():
        if value is not None:
            current[key] = str(value)
    return _log_context.set(current)


def reset_log_context(token: Token[dict[str, str]]) -> None:
    """Restore a previous log correlation context."""
    _log_context.reset(token)


def request_id_from_header(value: str | None) -> str:
    """Use a safe incoming request id or generate a new one."""
    request_id = (value or "").strip()
    if request_id and _safe_header_value(request_id):
        return request_id[:128]
    return uuid4().hex


def current_trace_context() -> tuple[str | None, str | None]:
    """Return current OpenTelemetry trace and span ids, if tracing is active."""
    try:
        from opentelemetry import trace
    except ImportError:
        return None, None

    try:
        span = trace.get_current_span()
        span_context = span.get_span_context()
    except Exception:
        return None, None

    if not getattr(span_context, "is_valid", False):
        return None, None
    return f"{span_context.trace_id:032x}", f"{span_context.span_id:016x}"


def _safe_header_value(value: str) -> bool:
    return all(32 <= ord(char) <= 126 for char in value)
