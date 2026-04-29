-- Survey-scoped RAG index for the insights chat
-- Apply manually in the Supabase SQL editor after 001 and 002.

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS response_chunks (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id   UUID        NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  response_id UUID        NOT NULL REFERENCES responses(id) ON DELETE CASCADE,
  chunk_index INT         NOT NULL,
  content     TEXT        NOT NULL,
  metadata    JSONB       NOT NULL DEFAULT '{}'::jsonb,
  embedding   VECTOR(768) NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (response_id, chunk_index)
);

CREATE INDEX IF NOT EXISTS response_chunks_survey_id_idx
  ON response_chunks (survey_id);

CREATE INDEX IF NOT EXISTS response_chunks_response_id_idx
  ON response_chunks (response_id);

CREATE INDEX IF NOT EXISTS response_chunks_embedding_hnsw_idx
  ON response_chunks
  USING hnsw (embedding vector_cosine_ops);

CREATE OR REPLACE FUNCTION match_response_chunks(
  p_survey_id UUID,
  p_query_embedding VECTOR(768),
  p_match_count INT DEFAULT 8,
  p_min_similarity FLOAT DEFAULT 0.25,
  p_sentiment TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  response_id UUID,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    response_chunks.id,
    response_chunks.response_id,
    response_chunks.content,
    response_chunks.metadata,
    1 - (response_chunks.embedding <=> p_query_embedding) AS similarity
  FROM response_chunks
  WHERE response_chunks.survey_id = p_survey_id
    AND (p_sentiment IS NULL OR response_chunks.metadata->>'sentiment' = p_sentiment)
    AND 1 - (response_chunks.embedding <=> p_query_embedding) >= p_min_similarity
  ORDER BY response_chunks.embedding <=> p_query_embedding
  LIMIT p_match_count;
$$;
