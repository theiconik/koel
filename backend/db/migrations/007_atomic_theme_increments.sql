-- Atomic per-survey theme aggregation.
-- Apply manually in the Supabase SQL editor after 006_idempotent_response_retry.sql.

CREATE OR REPLACE FUNCTION increment_survey_themes(
  p_survey_id UUID,
  p_tags TEXT[]
)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH normalized_tags AS (
    SELECT DISTINCT lower(btrim(tag)) AS name
    FROM unnest(COALESCE(p_tags, ARRAY[]::TEXT[])) AS input_tag(tag)
    WHERE length(btrim(tag)) > 0
  ),
  theme_rows AS (
    SELECT
      p_survey_id AS survey_id,
      name,
      1 AS count,
      (
        ARRAY[
          '#E8B04B',
          '#7C9CB5',
          '#B5857C',
          '#7CB585',
          '#9B7CB5',
          '#B5A87C'
        ]
      )[(get_byte(decode(md5(name), 'hex'), 0) % 6) + 1] AS color
    FROM normalized_tags
  )
  INSERT INTO themes (survey_id, name, count, color)
  SELECT survey_id, name, count, color
  FROM theme_rows
  ON CONFLICT (survey_id, name) DO UPDATE
  SET count = themes.count + EXCLUDED.count;
$$;
