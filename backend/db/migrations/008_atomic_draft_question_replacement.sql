-- Atomic replacement of draft survey questions.
-- Apply manually in the Supabase SQL editor after 007_atomic_theme_increments.sql.

CREATE OR REPLACE FUNCTION replace_draft_survey_questions(
  p_survey_id UUID,
  p_user_id TEXT,
  p_questions JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_survey surveys%ROWTYPE;
BEGIN
  SELECT *
  INTO v_survey
  FROM surveys
  WHERE surveys.id = p_survey_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'survey_not_found' USING ERRCODE = 'P0002';
  END IF;

  IF v_survey.user_id <> p_user_id THEN
    RAISE EXCEPTION 'not_your_survey' USING ERRCODE = '42501';
  END IF;

  IF v_survey.status <> 'draft' THEN
    RAISE EXCEPTION 'survey_not_draft' USING ERRCODE = '23000';
  END IF;

  DELETE FROM questions
  WHERE questions.survey_id = p_survey_id;

  INSERT INTO questions (survey_id, text, "order", active)
  SELECT
    p_survey_id,
    question_row.text,
    question_row."order",
    true
  FROM jsonb_to_recordset(COALESCE(p_questions, '[]'::jsonb))
    AS question_row(text TEXT, "order" INT);
END;
$$;
