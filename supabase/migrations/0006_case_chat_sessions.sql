-- Case practice: persist in-progress conversations per user + case

ALTER TABLE practice_sessions
  ADD COLUMN IF NOT EXISTS case_id TEXT REFERENCES case_questions(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'in_progress',
  ADD COLUMN IF NOT EXISTS locale TEXT;

ALTER TABLE practice_sessions DROP CONSTRAINT IF EXISTS practice_sessions_status_check;
ALTER TABLE practice_sessions
  ADD CONSTRAINT practice_sessions_status_check
  CHECK (status IN ('in_progress', 'completed', 'abandoned'));

CREATE INDEX IF NOT EXISTS idx_practice_sessions_case_active
  ON practice_sessions(user_id, case_id, status, updated_at DESC)
  WHERE session_type = 'case' AND case_id IS NOT NULL;
