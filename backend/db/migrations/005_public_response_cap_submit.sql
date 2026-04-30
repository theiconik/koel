-- Atomic public response submission with response cap and respondent policy enforcement.
-- Apply manually in the Supabase SQL editor after 004_response_processing_jobs.sql.

CREATE OR REPLACE FUNCTION create_public_response_with_processing_job(
  p_short_id TEXT,
  p_conversation_id TEXT,
  p_respondent_name TEXT DEFAULT NULL,
  p_respondent_role TEXT DEFAULT NULL,
  p_is_anonymous BOOLEAN DEFAULT false
)
RETURNS TABLE (id UUID, status TEXT, rejection_reason TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_survey surveys%ROWTYPE;
  v_response_count INT := 0;
  v_response_id UUID;
BEGIN
  SELECT *
  INTO v_survey
  FROM surveys
  WHERE surveys.short_id = p_short_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT NULL::UUID, 'rejected'::TEXT, 'survey_not_found'::TEXT;
    RETURN;
  END IF;

  IF v_survey.status <> 'live' THEN
    RETURN QUERY SELECT NULL::UUID, 'rejected'::TEXT, 'survey_not_live'::TEXT;
    RETURN;
  END IF;

  IF v_survey.response_cap IS NOT NULL THEN
    SELECT COUNT(*)
    INTO v_response_count
    FROM responses
    WHERE responses.survey_id = v_survey.id;

    IF v_response_count >= v_survey.response_cap THEN
      IF v_survey.close_on_response_cap THEN
        UPDATE surveys
        SET status = 'closed'
        WHERE surveys.id = v_survey.id;
      END IF;

      RETURN QUERY SELECT NULL::UUID, 'rejected'::TEXT, 'response_cap_reached'::TEXT;
      RETURN;
    END IF;
  END IF;

  IF COALESCE(p_is_anonymous, false)
     AND (
       NOT v_survey.allow_anonymous_responses
       OR v_survey.collect_respondent_name
     ) THEN
    RETURN QUERY SELECT NULL::UUID, 'rejected'::TEXT, 'anonymous_responses_not_allowed'::TEXT;
    RETURN;
  END IF;

  IF v_survey.collect_respondent_name
     AND length(btrim(COALESCE(p_respondent_name, ''))) = 0 THEN
    RETURN QUERY SELECT NULL::UUID, 'rejected'::TEXT, 'respondent_name_required'::TEXT;
    RETURN;
  END IF;

  INSERT INTO responses (
    survey_id,
    conversation_id,
    respondent_name,
    respondent_role,
    is_anonymous,
    processing_status
  )
  VALUES (
    v_survey.id,
    p_conversation_id,
    CASE
      WHEN COALESCE(p_is_anonymous, false) THEN NULL
      ELSE p_respondent_name
    END,
    CASE
      WHEN COALESCE(p_is_anonymous, false) THEN NULL
      ELSE p_respondent_role
    END,
    COALESCE(p_is_anonymous, false),
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
    v_survey.id,
    p_conversation_id,
    'queued',
    now()
  );

  IF v_survey.response_cap IS NOT NULL
     AND v_survey.close_on_response_cap
     AND v_response_count + 1 >= v_survey.response_cap THEN
    UPDATE surveys
    SET status = 'closed'
    WHERE surveys.id = v_survey.id;
  END IF;

  RETURN QUERY SELECT v_response_id, 'pending'::TEXT, NULL::TEXT;
END;
$$;
