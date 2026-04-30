"""Run the durable response-processing worker."""

from __future__ import annotations

import argparse
import asyncio
import logging
import os
import socket
import sys
from pathlib import Path
from uuid import uuid4

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from config.settings import settings
from config.logging_config import configure_logging
from config.log_context import bind_log_context, reset_log_context
from config.tracing import (
    configure_tracing,
    mark_error,
    record_exception,
    shutdown_tracing,
    start_span,
)
from services.processing import (
    PROCESSING_DONE,
    PROCESSING_FAILED,
    PROCESSING_RETRY,
    process_response,
)
from services.response_jobs import (
    JobFinalStatus,
    ResponseProcessingJob,
    claim_response_processing_jobs,
    finish_response_processing_job,
)

logger = logging.getLogger(__name__)


async def run_worker(
    worker_id: str,
    batch_size: int,
    lease_seconds: int,
    poll_interval_seconds: int,
    retry_delay_seconds: int,
    retry_max_delay_seconds: int,
    once: bool,
) -> None:
    worker_context = bind_log_context(worker_id=worker_id)
    logger.info("Response processing worker started")

    try:
        while True:
            jobs = claim_response_processing_jobs(
                worker_id=worker_id,
                batch_size=batch_size,
                lease_seconds=lease_seconds,
            )

            if not jobs:
                if once:
                    logger.info("No response processing jobs available")
                    return
                await asyncio.sleep(poll_interval_seconds)
                continue

            for job in jobs:
                await _process_job(
                    job,
                    worker_id,
                    retry_delay_seconds,
                    retry_max_delay_seconds,
                )

            if once:
                return
    finally:
        reset_log_context(worker_context)


async def _process_job(
    job: ResponseProcessingJob,
    worker_id: str,
    retry_delay_seconds: int,
    retry_max_delay_seconds: int,
) -> None:
    job_context = bind_log_context(
        job_id=job.id,
        response_id=job.response_id,
        survey_id=job.survey_id,
        attempt=job.attempts,
        max_attempts=job.max_attempts,
    )
    span_attributes = {
        "response_job.id": job.id,
        "response.id": job.response_id,
        "survey.id": job.survey_id,
        "response_job.attempt": job.attempts,
        "response_job.max_attempts": job.max_attempts,
    }
    try:
        with start_span("response_job.process", span_attributes):
            try:
                logger.info("Processing response job")
                result = await process_response(
                    response_id=job.response_id,
                    survey_id=job.survey_id,
                    conversation_id=job.conversation_id,
                )
            except Exception as exc:
                record_exception(exc)
                logger.exception("Unhandled worker error")
                delay_seconds = _retry_delay_seconds(
                    job,
                    retry_delay_seconds,
                    retry_max_delay_seconds,
                )
                _finish_job(
                    job_id=job.id,
                    worker_id=worker_id,
                    status="failed",
                    error=str(exc),
                    retry=True,
                    retry_delay_seconds=delay_seconds,
                )
                return

            if result.status == PROCESSING_DONE:
                _finish_job(
                    job_id=job.id,
                    worker_id=worker_id,
                    status="succeeded",
                )
                return

            if result.status == PROCESSING_RETRY:
                delay_seconds = _retry_delay_seconds(
                    job,
                    retry_delay_seconds,
                    retry_max_delay_seconds,
                )
                logger.warning(
                    "Response processing will be retried in %d second(s): %s",
                    delay_seconds,
                    result.error,
                )
                _finish_job(
                    job_id=job.id,
                    worker_id=worker_id,
                    status="failed",
                    error=result.error or "Response processing needs retry",
                    retry=True,
                    retry_delay_seconds=delay_seconds,
                )
                return

            _finish_job(
                job_id=job.id,
                worker_id=worker_id,
                status="failed",
                error=result.error or "Response processing failed",
                retry=False,
            )
            if result.status != PROCESSING_FAILED:
                mark_error("Response processing finished with invalid status")
            else:
                mark_error(result.error or "Response processing failed")
            return
    finally:
        reset_log_context(job_context)


def _retry_delay_seconds(
    job: ResponseProcessingJob,
    base_delay_seconds: int,
    max_delay_seconds: int,
) -> int:
    base_delay = max(base_delay_seconds, 1)
    max_delay = max(max_delay_seconds, base_delay)
    exponent = max(job.attempts - 1, 0)
    return min(max_delay, base_delay * (2**exponent))


def _finish_job(
    *,
    job_id: str,
    worker_id: str,
    status: JobFinalStatus,
    error: str | None = None,
    retry: bool = False,
    retry_delay_seconds: int = 60,
) -> None:
    try:
        finish_response_processing_job(
            job_id=job_id,
            worker_id=worker_id,
            status=status,
            error=error,
            retry=retry,
            retry_delay_seconds=retry_delay_seconds,
        )
    except Exception as exc:
        record_exception(exc)
        mark_error("Could not finish response processing job")
        logger.exception("Could not finish response processing job")


def _default_worker_id() -> str:
    return f"{socket.gethostname()}:{os.getpid()}:{uuid4().hex[:8]}"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--once", action="store_true", help="Claim one batch, then exit")
    parser.add_argument("--worker-id", default=_default_worker_id())
    parser.add_argument("--batch-size", type=int, default=settings.response_job_batch_size)
    parser.add_argument("--lease-seconds", type=int, default=settings.response_job_lease_seconds)
    parser.add_argument(
        "--poll-interval-seconds",
        type=int,
        default=settings.response_job_poll_interval_seconds,
    )
    parser.add_argument(
        "--retry-delay-seconds",
        type=int,
        default=settings.response_job_retry_delay_seconds,
    )
    parser.add_argument(
        "--retry-max-delay-seconds",
        type=int,
        default=settings.response_job_retry_max_delay_seconds,
    )
    return parser.parse_args()


def main() -> None:
    configure_logging(level=settings.log_level, fmt=settings.log_format)  # type: ignore[arg-type]
    configure_tracing(settings)
    args = parse_args()
    try:
        asyncio.run(
            run_worker(
                worker_id=args.worker_id,
                batch_size=args.batch_size,
                lease_seconds=args.lease_seconds,
                poll_interval_seconds=args.poll_interval_seconds,
                retry_delay_seconds=args.retry_delay_seconds,
                retry_max_delay_seconds=args.retry_max_delay_seconds,
                once=args.once,
            )
        )
    finally:
        shutdown_tracing()


if __name__ == "__main__":
    main()
