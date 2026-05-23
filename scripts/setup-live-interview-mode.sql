-- Live Interview Mode schema (run in Supabase SQL Editor after session tables exist)
-- See supabase/migrations/0008_live_interview_mode.sql

ALTER TABLE case_questions ADD COLUMN IF NOT EXISTS branching_tree JSONB;
ALTER TABLE case_questions ADD COLUMN IF NOT EXISTS supports_live_mode BOOLEAN DEFAULT false;

ALTER TABLE practice_sessions ADD COLUMN IF NOT EXISTS mode TEXT DEFAULT 'practice';
ALTER TABLE practice_sessions ADD COLUMN IF NOT EXISTS visited_nodes TEXT[] DEFAULT '{}';
ALTER TABLE practice_sessions ADD COLUMN IF NOT EXISTS interrupt_events JSONB DEFAULT '[]';
ALTER TABLE practice_sessions ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;
ALTER TABLE practice_sessions ADD COLUMN IF NOT EXISTS time_limit_seconds INT DEFAULT 900;

ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'normal';
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS node_id TEXT;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS metadata JSONB;

UPDATE case_questions SET supports_live_mode = true
WHERE title ILIKE '%profitability%'
   OR title ILIKE '%market entry%'
   OR title ILIKE '%profit%'
   OR title ILIKE '%零售%'
   OR title ILIKE '%咖啡%'
   OR id IN ('retail-profit', 'coffee-china');
