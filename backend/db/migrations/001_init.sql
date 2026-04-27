-- koel database schema
-- Apply manually in the Supabase SQL editor

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── surveys ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS surveys (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT        NOT NULL,          -- Clerk user ID (sub claim)
  title       TEXT        NOT NULL,
  description TEXT        NOT NULL DEFAULT '',
  status      TEXT        NOT NULL DEFAULT 'draft'
                          CHECK (status IN ('live', 'draft', 'closed')),
  short_id    TEXT        UNIQUE NOT NULL,   -- 8-char URL-safe token for share link
  response_cap INT,
  language    TEXT        NOT NULL DEFAULT 'en',
  follow_up_depth INT     NOT NULL DEFAULT 2,
  collect_respondent_name BOOLEAN NOT NULL DEFAULT false,
  allow_anonymous_responses BOOLEAN NOT NULL DEFAULT true,
  email_transcript BOOLEAN NOT NULL DEFAULT false,
  close_on_response_cap BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS surveys_user_id_idx ON surveys (user_id);

-- ─── questions ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS questions (
  id         UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id  UUID    NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  text       TEXT    NOT NULL,
  "order"    INT     NOT NULL DEFAULT 0,
  active     BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS questions_survey_id_idx ON questions (survey_id);

-- ─── responses ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS responses (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id          UUID        NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  conversation_id    TEXT,                    -- ElevenLabs conversation ID
  respondent_name    TEXT,
  respondent_role    TEXT,
  is_anonymous       BOOLEAN     NOT NULL DEFAULT false,
  transcript         TEXT,                    -- raw transcript, filled async
  transcript_json    JSONB       NOT NULL DEFAULT '[]'::jsonb,
  quote              TEXT,                    -- headline quote, filled by LLM
  summary            TEXT,
  sentiment          TEXT        NOT NULL DEFAULT 'neutral'
                                 CHECK (sentiment IN ('delighted', 'neutral', 'frustrated')),
  tags               TEXT[],                  -- theme tags, filled by LLM
  duration_seconds   INT,                     -- from ElevenLabs metadata
  processing_error   TEXT,
  processing_status  TEXT        NOT NULL DEFAULT 'pending'
                                 CHECK (processing_status IN ('pending', 'processing', 'done', 'failed')),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS responses_survey_id_idx ON responses (survey_id);

-- ─── themes ─────────────────────────────────────────────────────────────────
-- Aggregated per-survey theme counts, updated as responses are processed.
CREATE TABLE IF NOT EXISTS themes (
  id         UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id  UUID    NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  name       TEXT    NOT NULL,
  count      INT     NOT NULL DEFAULT 1,
  color      TEXT    NOT NULL DEFAULT '#E8B04B',
  summary    TEXT,
  quotes     JSONB   NOT NULL DEFAULT '[]'::jsonb,
  UNIQUE (survey_id, name)
);

CREATE INDEX IF NOT EXISTS themes_survey_id_idx ON themes (survey_id);
