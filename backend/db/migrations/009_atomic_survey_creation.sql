-- Atomic survey creation with initial questions.
-- Apply manually in the Supabase SQL editor after 008_atomic_draft_question_replacement.sql.

CREATE OR REPLACE FUNCTION create_survey_with_questions(
  p_user_id TEXT,
  p_title TEXT,
  p_description TEXT,
  p_status TEXT,
  p_short_id TEXT,
  p_response_cap INT,
  p_language TEXT,
  p_follow_up_depth INT,
  p_collect_respondent_name BOOLEAN,
  p_allow_anonymous_responses BOOLEAN,
  p_email_transcript BOOLEAN,
  p_close_on_response_cap BOOLEAN,
  p_questions JSONB
)
RETURNS TABLE (
  survey JSONB,
  questions JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_survey surveys%ROWTYPE;
BEGIN
  INSERT INTO surveys (
    user_id,
    title,
    description,
    status,
    short_id,
    response_cap,
    language,
    follow_up_depth,
    collect_respondent_name,
    allow_anonymous_responses,
    email_transcript,
    close_on_response_cap
  )
  VALUES (
    p_user_id,
    p_title,
    p_description,
    p_status,
    p_short_id,
    p_response_cap,
    p_language,
    p_follow_up_depth,
    p_collect_respondent_name,
    p_allow_anonymous_responses,
    p_email_transcript,
    p_close_on_response_cap
  )
  RETURNING * INTO v_survey;

  INSERT INTO questions (survey_id, text, "order", active)
  SELECT
    v_survey.id,
    question_row.text,
    question_row."order",
    true
  FROM jsonb_to_recordset(COALESCE(p_questions, '[]'::jsonb))
    AS question_row(text TEXT, "order" INT);

  RETURN QUERY
  SELECT
    to_jsonb(v_survey) AS survey,
    COALESCE(
      jsonb_agg(to_jsonb(q) ORDER BY q."order") FILTER (WHERE q.id IS NOT NULL),
      '[]'::jsonb
    ) AS questions
  FROM questions q
  WHERE q.survey_id = v_survey.id
    AND q.active = true;
END;
$$;
