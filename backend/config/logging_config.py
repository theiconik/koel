"""
Logging configuration.

Call configure_logging() once at application startup (main.py lifespan).
Supports two output formats:
  - "text"  plain human-readable output (default, good for local dev)
  - "json"  structured JSON lines (good for cloud log aggregators)
"""

import logging
import logging.config
from typing import Literal

from config.log_context import current_trace_context, get_log_context

_SAFE_EXTRA_ATTRS = {
    "request_id",
    "trace_id",
    "span_id",
    "job_id",
    "response_id",
    "survey_id",
    "worker_id",
    "status_code",
    "method",
    "path",
    "attempt",
    "max_attempts",
}


def configure_logging(
    level: str = "INFO",
    fmt: Literal["text", "json"] = "text",
) -> None:
    """
    Apply logging configuration to the root logger.

    Args:
        level: Standard Python log level string ("DEBUG", "INFO", etc.)
        fmt:   "text" for human-readable, "json" for structured JSON lines.
    """
    if fmt == "json":
        formatter_class = _JsonFormatter
        fmt_string = ""  # unused by _JsonFormatter
    else:
        formatter_class = _TextFormatter
        fmt_string = "%(asctime)s  %(levelname)-8s  %(name)s  %(correlation)s%(message)s"

    config: dict = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "default": {
                "()": formatter_class,
                **({"fmt": fmt_string} if fmt == "text" else {}),
            }
        },
        "filters": {
            "context": {
                "()": _CorrelationFilter,
            }
        },
        "handlers": {
            "console": {
                "class": "logging.StreamHandler",
                "stream": "ext://sys.stdout",
                "formatter": "default",
                "filters": ["context"],
            }
        },
        "root": {
            "level": level,
            "handlers": ["console"],
        },
        # Silence chatty third-party loggers at WARNING unless DEBUG
        "loggers": {
            "httpx": {"level": "WARNING", "propagate": True},
            "httpcore": {"level": "WARNING", "propagate": True},
            "uvicorn.access": {"level": "WARNING", "propagate": True},
        },
    }

    logging.config.dictConfig(config)


class _CorrelationFilter(logging.Filter):
    """Attach request/job and trace context to every log record."""

    def filter(self, record: logging.LogRecord) -> bool:
        context = get_log_context()
        trace_id, span_id = current_trace_context()
        context.setdefault("trace_id", trace_id or "")
        context.setdefault("span_id", span_id or "")

        for key, value in context.items():
            if key in _SAFE_EXTRA_ATTRS and value and not hasattr(record, key):
                setattr(record, key, value)

        parts = []
        request_id = getattr(record, "request_id", "")
        trace_id = getattr(record, "trace_id", "")
        job_id = getattr(record, "job_id", "")
        response_id = getattr(record, "response_id", "")
        if request_id:
            parts.append(f"req={request_id}")
        if job_id:
            parts.append(f"job={job_id[:12]}")
        if response_id:
            parts.append(f"response={response_id[:12]}")
        if trace_id:
            parts.append(f"trace={trace_id[:12]}")
        record.correlation = f"[{' '.join(parts)}] " if parts else ""
        return True


class _TextFormatter(logging.Formatter):
    pass


class _JsonFormatter(logging.Formatter):
    """Minimal JSON-lines formatter — no extra dependencies required."""

    def format(self, record: logging.LogRecord) -> str:
        import json
        import traceback

        record.message = record.getMessage()
        payload: dict = {
            "time": self.formatTime(record, "%Y-%m-%dT%H:%M:%S"),
            "level": record.levelname,
            "logger": record.name,
            "message": record.message,
        }
        for key in sorted(_SAFE_EXTRA_ATTRS):
            value = getattr(record, key, None)
            if value:
                payload[key] = value
        if record.exc_info:
            payload["exc"] = "".join(traceback.format_exception(*record.exc_info))
        return json.dumps(payload)
