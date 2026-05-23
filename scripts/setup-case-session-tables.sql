-- =============================================================================
-- Case Practice — chat session persistence (run in Supabase SQL Editor)
-- Requires: nothing else for sessions; case_slug does not reference case_questions
-- =============================================================================

-- Base tables (from 0001_init.sql)
CREATE TABLE IF NOT EXISTS practice_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  session_type TEXT NOT NULL CHECK (session_type IN ('resume', 'interview', 'case')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES practice_sessions(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- If table already exists without user_id, add it:
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Case practice columns (0006 + 0007)
ALTER TABLE practice_sessions
  ADD COLUMN IF NOT EXISTS case_id TEXT,
  ADD COLUMN IF NOT EXISTS case_slug TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'in_progress',
  ADD COLUMN IF NOT EXISTS locale TEXT;

UPDATE practice_sessions SET status = 'in_progress' WHERE status IS NULL;

ALTER TABLE practice_sessions ALTER COLUMN status SET DEFAULT 'in_progress';
ALTER TABLE practice_sessions ALTER COLUMN status SET NOT NULL;

ALTER TABLE practice_sessions DROP CONSTRAINT IF EXISTS practice_sessions_status_check;
ALTER TABLE practice_sessions
  ADD CONSTRAINT practice_sessions_status_check
  CHECK (status IN ('in_progress', 'completed', 'abandoned'));

CREATE INDEX IF NOT EXISTS idx_practice_sessions_user
  ON practice_sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session
  ON chat_messages(session_id);

DROP INDEX IF EXISTS idx_practice_sessions_case_active;

CREATE INDEX IF NOT EXISTS idx_practice_sessions_case_slug_active
  ON practice_sessions(user_id, case_slug, status, updated_at DESC)
  WHERE session_type = 'case' AND case_slug IS NOT NULL;
