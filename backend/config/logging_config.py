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
        formatter_class = logging.Formatter
        fmt_string = "%(asctime)s  %(levelname)-8s  %(name)s  %(message)s"

    config: dict = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "default": {
                "()": formatter_class,
                **({"fmt": fmt_string} if fmt == "text" else {}),
            }
        },
        "handlers": {
            "console": {
                "class": "logging.StreamHandler",
                "stream": "ext://sys.stdout",
                "formatter": "default",
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


class _JsonFormatter(logging.Formatter):
    """Minimal JSON-lines formatter — no extra dependencies required."""

    def format(self, record: logging.LogRecord) -> str:
        import json
        import traceback

        payload: dict = {
            "time": self.formatTime(record, "%Y-%m-%dT%H:%M:%S"),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        if record.exc_info:
            payload["exc"] = "".join(traceback.format_exception(*record.exc_info))
        return json.dumps(payload)
