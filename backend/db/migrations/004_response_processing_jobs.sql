-- Durable queue for processing submitted voice responses.
-- Apply manually in the Supabase SQL editor after 001, 002, and 003.

CREATE TABLE IF NOT EXISTS response_processing_jobs (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id     UUID        NOT NULL REFERENCES responses(id) ON DELETE CASCADE,
  survey_id       UUID        NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  conversation_id TEXT        NOT NULL,
  status          TEXT        NOT NULL DEFAULT 'queued'
                              CHECK (status IN ('queued', 'processing', 'succeeded', 'failed')),
  attempts        INT         NOT NULL DEFAULT 0,
  max_attempts    INT         NOT NULL DEFAULT 5,
  run_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  locked_at       TIMESTAMPTZ,
  locked_by       TEXT,
  last_error      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (response_id)
);

CREATE INDEX IF NOT EXISTS response_processing_jobs_status_run_at_idx
  ON response_processing_jobs (status, run_at);

CREATE INDEX IF NOT EXISTS response_processing_jobs_response_id_idx
  ON response_processing_jobs (response_id);

CREATE OR REPLACE FUNCTION create_response_with_processing_job(
  p_survey_id UUID,
  p_conversation_id TEXT,
  p_respondent_name TEXT DEFAULT NULL,
  p_respondent_role TEXT DEFAULT NULL,
  p_is_anonymous BOOLEAN DEFAULT false
)
RETURNS TABLE (id UUID, status TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_response_id UUID;
BEGIN
  INSERT INTO responses (
    survey_id,
    conversation_id,
    respondent_name,
    respondent_role,
    is_anonymous,
    processing_status
  )
  VALUES (
    p_survey_id,
    p_conversation_id,
    p_respondent_name,
    p_respondent_role,
    p_is_anonymous,
    'pending'
  )
  RETURNING responses.id INTO v_response_id;

  INSERT INTO response_processing_jobs (
    response_id,
    survey_id,
    conversation_id,
    status,
    run_at
  )
  VALUES (
    v_response_id,
    p_survey_id,
    p_conversation_id,
    'queued',
    now()
  );

  RETURN QUERY SELECT v_response_id, 'pending'::TEXT;
END;
$$;

CREATE OR REPLACE FUNCTION requeue_response_processing_job(
  p_response_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_response responses%ROWTYPE;
  v_job_id UUID;
BEGIN
  SELECT *
  INTO v_response
  FROM responses
  WHERE responses.id = p_response_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Response % not found', p_response_id;
  END IF;

  IF v_response.conversation_id IS NULL OR length(v_response.conversation_id) = 0 THEN
    RAISE EXCEPTION 'Response % has no conversation id', p_response_id;
  END IF;

  UPDATE responses
  SET processing_status = 'pending',
      processing_error = NULL
  WHERE responses.id = p_response_id;

  INSERT INTO response_processing_jobs (
    response_id,
    survey_id,
    conversation_id,
    status,
    attempts,
    run_at,
    locked_at,
    locked_by,
    last_error,
    updated_at
  )
  VALUES (
    v_response.id,
    v_response.survey_id,
    v_response.conversation_id,
    'queued',
    0,
    now(),
    NULL,
    NULL,
    NULL,
    now()
  )
  ON CONFLICT (response_id) DO UPDATE
  SET survey_id = EXCLUDED.survey_id,
      conversation_id = EXCLUDED.conversation_id,
      status = 'queued',
      attempts = 0,
      run_at = now(),
      locked_at = NULL,
      locked_by = NULL,
      last_error = NULL,
      updated_at = now()
  RETURNING response_processing_jobs.id INTO v_job_id;

  RETURN v_job_id;
END;
$$;

CREATE OR REPLACE FUNCTION claim_response_processing_jobs(
  p_worker_id TEXT,
  p_batch_size INT DEFAULT 1,
  p_lease_seconds INT DEFAULT 900
)
RETURNS SETOF response_processing_jobs
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH candidates AS (
    SELECT j.id
    FROM response_processing_jobs j
    WHERE (
        j.status = 'queued'
        AND j.run_at <= now()
        AND j.attempts < j.max_attempts
      )
      OR (
        j.status = 'processing'
        AND j.locked_at < now() - make_interval(secs => p_lease_seconds)
      )
    ORDER BY j.run_at ASC, j.created_at ASC
    LIMIT GREATEST(p_batch_size, 1)
    FOR UPDATE SKIP LOCKED
  )
  UPDATE response_processing_jobs j
  SET status = 'processing',
      locked_by = p_worker_id,
      locked_at = now(),
      attempts = j.attempts + 1,
      updated_at = now()
  FROM candidates
  WHERE j.id = candidates.id
  RETURNING j.*;
END;
$$;

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
        run_at = now() + make_interval(secs => p_retry_delay_seconds),
        locked_by = NULL,
        locked_at = NULL,
        last_error = p_error,
        updated_at = now()
    WHERE id = p_job_id
    RETURNING * INTO v_job;

    UPDATE responses
    SET processing_status = 'pending',
        processing_error = p_error
    WHERE responses.id = v_job.response_id
      AND responses.processing_status <> 'done';
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
        processing_error = COALESCE(responses.processing_error, p_error, 'Response processing failed')
    WHERE responses.id = v_job.response_id
      AND responses.processing_status <> 'done';
  END IF;

  RETURN v_job;
END;
$$;
