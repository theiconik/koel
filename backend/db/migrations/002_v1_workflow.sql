-- V1 workflow stitching additions for existing Supabase projects.

ALTER TABLE surveys
  ADD COLUMN IF NOT EXISTS response_cap INT,
  ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS follow_up_depth INT NOT NULL DEFAULT 2,
  ADD COLUMN IF NOT EXISTS collect_respondent_name BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS allow_anonymous_responses BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS email_transcript BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS close_on_response_cap BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE questions
  ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE responses
  ADD COLUMN IF NOT EXISTS transcript_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS summary TEXT,
  ADD COLUMN IF NOT EXISTS sentiment TEXT NOT NULL DEFAULT 'neutral',
  ADD COLUMN IF NOT EXISTS processing_error TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'responses_sentiment_check'
  ) THEN
    ALTER TABLE responses
      ADD CONSTRAINT responses_sentiment_check
      CHECK (sentiment IN ('delighted', 'neutral', 'frustrated'));
  END IF;
END $$;

ALTER TABLE themes
  ADD COLUMN IF NOT EXISTS summary TEXT,
  ADD COLUMN IF NOT EXISTS quotes JSONB NOT NULL DEFAULT '[]'::jsonb;
