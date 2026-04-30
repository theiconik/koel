-- Make manual response retries idempotent and status-gated.
-- Apply manually in the Supabase SQL editor after 005_public_response_cap_submit.sql.

DROP FUNCTION IF EXISTS requeue_response_processing_job(UUID);

CREATE OR REPLACE FUNCTION requeue_response_processing_job(
  p_response_id UUID
)
RETURNS TABLE (
  id UUID,
  status TEXT,
  current_status TEXT,
  rejection_reason TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_response responses%ROWTYPE;
  v_job response_processing_jobs%ROWTYPE;
BEGIN
  SELECT *
  INTO v_response
  FROM responses
  WHERE responses.id = p_response_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT NULL::UUID, 'rejected'::TEXT, NULL::TEXT, 'response_not_found'::TEXT;
    RETURN;
  END IF;

  IF v_response.conversation_id IS NULL OR length(v_response.conversation_id) = 0 THEN
    RETURN QUERY SELECT v_response.id, 'rejected'::TEXT, v_response.processing_status, 'missing_conversation_id'::TEXT;
    RETURN;
  END IF;

  IF v_response.processing_status <> 'failed' THEN
    RETURN QUERY SELECT v_response.id, 'rejected'::TEXT, v_response.processing_status, 'response_not_failed'::TEXT;
    RETURN;
  END IF;

  SELECT *
  INTO v_job
  FROM response_processing_jobs
  WHERE response_processing_jobs.response_id = p_response_id
  FOR UPDATE;

  IF FOUND AND v_job.status IN ('queued', 'processing') THEN
    RETURN QUERY SELECT v_response.id, 'rejected'::TEXT, v_response.processing_status, 'active_processing_job'::TEXT;
    RETURN;
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
      updated_at = now();

  RETURN QUERY SELECT v_response.id, 'pending'::TEXT, 'pending'::TEXT, NULL::TEXT;
END;
$$;
