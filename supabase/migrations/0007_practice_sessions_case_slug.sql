-- Store catalog case id (e.g. coffee-china) separately from case_id UUID column

ALTER TABLE practice_sessions
  ADD COLUMN IF NOT EXISTS case_slug TEXT;

-- Backfill from case_id when it was stored as text slug
UPDATE practice_sessions
SET case_slug = case_id::text
WHERE case_slug IS NULL
  AND case_id IS NOT NULL
  AND session_type = 'case';

DROP INDEX IF EXISTS idx_practice_sessions_case_active;

CREATE INDEX IF NOT EXISTS idx_practice_sessions_case_slug_active
  ON practice_sessions(user_id, case_slug, status, updated_at DESC)
  WHERE session_type = 'case' AND case_slug IS NOT NULL;
