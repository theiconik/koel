-- Atomic replacement of response retrieval chunks.
-- Apply manually in the Supabase SQL editor after 009_atomic_survey_creation.sql.

CREATE OR REPLACE FUNCTION replace_response_chunks(
  p_response_id UUID,
  p_survey_id UUID,
  p_chunks JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_response responses%ROWTYPE;
BEGIN
  SELECT *
  INTO v_response
  FROM responses
  WHERE responses.id = p_response_id
    AND responses.survey_id = p_survey_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'response_not_found' USING ERRCODE = 'P0002';
  END IF;

  DELETE FROM response_chunks
  WHERE response_chunks.response_id = p_response_id;

  INSERT INTO response_chunks (
    survey_id,
    response_id,
    chunk_index,
    content,
    metadata,
    embedding
  )
  SELECT
    p_survey_id,
    p_response_id,
    chunk_row.chunk_index,
    chunk_row.content,
    COALESCE(chunk_row.metadata, '{}'::jsonb),
    chunk_row.embedding::text::vector(768)
  FROM jsonb_to_recordset(COALESCE(p_chunks, '[]'::jsonb))
    AS chunk_row(
      chunk_index INT,
      content TEXT,
      metadata JSONB,
      embedding JSONB
    )
  ORDER BY chunk_row.chunk_index;
END;
$$;
