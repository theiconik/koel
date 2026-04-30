"""OpenTelemetry tracing setup.

Tracing is opt-in and safe for local imports. If OpenTelemetry packages are not
installed yet, setup degrades to no-op logging instead of failing app startup.
"""

from __future__ import annotations

import logging
from contextlib import contextmanager
from typing import Iterator, Mapping
from urllib.parse import unquote, urlparse

from config.settings import Settings

logger = logging.getLogger(__name__)

_provider_configured = False
_http_clients_instrumented = False


def configure_tracing(settings: Settings, app: object | None = None) -> bool:
    """Configure tracing and instrument supported integrations when enabled."""
    if not settings.otel_enabled:
        return False

    try:
        _configure_provider(settings)
        _instrument_http_clients()
        if app is not None:
            _instrument_fastapi_app(app)
    except ImportError as exc:
        logger.warning("OpenTelemetry tracing disabled; missing package: %s", exc.name)
        return False

    logger.info(
        "OpenTelemetry tracing enabled: service=%s exporter=%s sample_rate=%s",
        settings.otel_service_name,
        "otlp" if settings.otel_exporter_otlp_endpoint else "console",
        settings.otel_traces_sample_rate,
    )
    return True


def shutdown_tracing() -> None:
    """Flush and shut down the configured tracer provider, if any."""
    try:
        from opentelemetry import trace
    except ImportError:
        return

    provider = trace.get_tracer_provider()
    shutdown = getattr(provider, "shutdown", None)
    if callable(shutdown):
        shutdown()


@contextmanager
def start_span(name: str, attributes: Mapping[str, object] | None = None) -> Iterator[object]:
    """Start a span without forcing callers to import OpenTelemetry directly."""
    try:
        from opentelemetry import trace
    except ImportError:
        yield _NoopSpan()
        return

    tracer = trace.get_tracer(__name__)
    with tracer.start_as_current_span(name) as span:
        if attributes:
            _set_span_attributes(span, attributes)
        yield span


def record_exception(exc: BaseException) -> None:
    """Record an exception on the current span without logging sensitive values."""
    _set_current_span_error(type(exc).__name__, exc)


def set_current_span_attributes(attributes: Mapping[str, object]) -> None:
    """Add non-sensitive attributes to the current span, if tracing is active."""
    try:
        from opentelemetry import trace
    except ImportError:
        return

    span = trace.get_current_span()
    if span and span.is_recording():
        _set_span_attributes(span, attributes)


def mark_error(message: str) -> None:
    """Mark the current span as failed without recording sensitive payloads."""
    _set_current_span_error(message)


def _set_current_span_error(message: str, exc: BaseException | None = None) -> None:
    try:
        from opentelemetry import trace
        from opentelemetry.trace import Status, StatusCode
    except ImportError:
        return

    span = trace.get_current_span()
    if not span or not span.is_recording():
        return

    if exc is not None:
        span.record_exception(exc)
    span.set_status(Status(StatusCode.ERROR, message))


def _configure_provider(settings: Settings) -> None:
    global _provider_configured
    if _provider_configured:
        return

    from opentelemetry import trace
    from opentelemetry.sdk.resources import Resource
    from opentelemetry.sdk.trace import TracerProvider
    from opentelemetry.sdk.trace.export import BatchSpanProcessor, ConsoleSpanExporter
    from opentelemetry.sdk.trace.sampling import ParentBased, TraceIdRatioBased

    resource = Resource.create({"service.name": settings.otel_service_name})
    sampler = ParentBased(TraceIdRatioBased(settings.otel_traces_sample_rate))
    provider = TracerProvider(resource=resource, sampler=sampler)

    if settings.otel_exporter_otlp_endpoint:
        from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter

        exporter = OTLPSpanExporter(
            endpoint=_otlp_trace_endpoint(settings.otel_exporter_otlp_endpoint),
            headers=_parse_otlp_headers(settings.otel_exporter_otlp_headers),
        )
    else:
        exporter = ConsoleSpanExporter()

    provider.add_span_processor(BatchSpanProcessor(exporter))
    trace.set_tracer_provider(provider)
    _provider_configured = True


def _instrument_http_clients() -> None:
    global _http_clients_instrumented
    if _http_clients_instrumented:
        return

    from opentelemetry.instrumentation.httpx import HTTPXClientInstrumentor
    from opentelemetry.instrumentation.requests import RequestsInstrumentor

    HTTPXClientInstrumentor().instrument()
    RequestsInstrumentor().instrument()
    _http_clients_instrumented = True


def _instrument_fastapi_app(app: object) -> None:
    from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor

    FastAPIInstrumentor.instrument_app(app)


def _parse_otlp_headers(raw_headers: str) -> dict[str, str]:
    headers: dict[str, str] = {}
    if not raw_headers:
        return headers

    for item in raw_headers.split(","):
        if "=" not in item:
            logger.warning("Ignoring malformed OTLP header entry")
            continue
        key, value = item.split("=", 1)
        key = unquote(key.strip())
        if not key:
            logger.warning("Ignoring OTLP header with empty key")
            continue
        headers[key] = unquote(value.strip())
    return headers


def _otlp_trace_endpoint(endpoint: str) -> str:
    parsed = urlparse(endpoint)
    if parsed.path in ("", "/"):
        return f"{endpoint.rstrip('/')}/v1/traces"
    return endpoint


def _set_span_attributes(span: object, attributes: Mapping[str, object]) -> None:
    set_attribute = getattr(span, "set_attribute", None)
    if not callable(set_attribute):
        return

    for key, value in attributes.items():
        if value is not None:
            set_attribute(key, value)


class _NoopSpan:
    def is_recording(self) -> bool:
        return False

    def set_attribute(self, key: str, value: object) -> None:
        return None
