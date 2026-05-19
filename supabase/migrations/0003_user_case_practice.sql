-- User case preferences and practice history (Clerk user_id)

CREATE TABLE IF NOT EXISTS user_preferences (
  user_id TEXT PRIMARY KEY,
  recommended_difficulty TEXT CHECK (recommended_difficulty IN ('easy', 'medium', 'hard')),
  diagnosis_completed BOOLEAN NOT NULL DEFAULT FALSE,
  diagnosis_result JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_practice_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  case_id TEXT NOT NULL REFERENCES case_questions(id) ON DELETE CASCADE,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  scores JSONB,
  overall_score INTEGER,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_practice_history_user
  ON user_practice_history(user_id, completed_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_practice_history_case
  ON user_practice_history(user_id, case_id);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_practice_history ENABLE ROW LEVEL SECURITY;

-- RLS: users may only access their own rows (Clerk JWT sub = user_id when using authenticated client)
CREATE POLICY user_preferences_select_own ON user_preferences
  FOR SELECT USING (user_id = (auth.jwt() ->> 'sub'));

CREATE POLICY user_preferences_insert_own ON user_preferences
  FOR INSERT WITH CHECK (user_id = (auth.jwt() ->> 'sub'));

CREATE POLICY user_preferences_update_own ON user_preferences
  FOR UPDATE USING (user_id = (auth.jwt() ->> 'sub'));

CREATE POLICY user_practice_history_select_own ON user_practice_history
  FOR SELECT USING (user_id = (auth.jwt() ->> 'sub'));

CREATE POLICY user_practice_history_insert_own ON user_practice_history
  FOR INSERT WITH CHECK (user_id = (auth.jwt() ->> 'sub'));
