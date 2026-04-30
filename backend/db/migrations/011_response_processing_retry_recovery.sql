-- Keep user-visible response state aligned with automatic worker retries.
-- Apply manually in the Supabase SQL editor after 010_atomic_response_chunk_replacement.sql.

CREATE OR REPLACE FUNCTION finish_response_processing_job(
  p_job_id UUID,
  p_worker_id TEXT,
  p_status TEXT,
  p_error TEXT DEFAULT NULL,
  p_retry BOOLEAN DEFAULT false,
  p_retry_delay_seconds INT DEFAULT 60
)
RETURNS response_processing_jobs
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_job response_processing_jobs%ROWTYPE;
BEGIN
  IF p_status NOT IN ('succeeded', 'failed') THEN
    RAISE EXCEPTION 'Invalid final job status: %', p_status;
  END IF;

  SELECT *
  INTO v_job
  FROM response_processing_jobs
  WHERE id = p_job_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Response processing job % not found', p_job_id;
  END IF;

  IF v_job.status <> 'processing' OR v_job.locked_by IS DISTINCT FROM p_worker_id THEN
    RAISE EXCEPTION 'Response processing job % is not locked by %', p_job_id, p_worker_id;
  END IF;

  IF p_status = 'succeeded' THEN
    UPDATE response_processing_jobs
    SET status = 'succeeded',
        locked_by = NULL,
        locked_at = NULL,
        last_error = NULL,
        updated_at = now()
    WHERE id = p_job_id
    RETURNING * INTO v_job;
  ELSIF p_retry AND v_job.attempts < v_job.max_attempts THEN
    UPDATE response_processing_jobs
    SET status = 'queued',
        run_at = now() + make_interval(secs => GREATEST(p_retry_delay_seconds, 1)),
        locked_by = NULL,
        locked_at = NULL,
        last_error = p_error,
        updated_at = now()
    WHERE id = p_job_id
    RETURNING * INTO v_job;

    UPDATE responses
    SET processing_status = 'pending',
        processing_error = p_error
    WHERE responses.id = v_job.response_id;
  ELSE
    UPDATE response_processing_jobs
    SET status = 'failed',
        locked_by = NULL,
        locked_at = NULL,
        last_error = p_error,
        updated_at = now()
    WHERE id = p_job_id
    RETURNING * INTO v_job;

    UPDATE responses
    SET processing_status = 'failed',
        processing_error = COALESCE(p_error, 'Response processing failed')
    WHERE responses.id = v_job.response_id;
  END IF;

  RETURN v_job;
END;
$$;
