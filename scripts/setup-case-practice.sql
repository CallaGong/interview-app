-- =============================================================================
-- CaseReady — full Case practice schema (run once in Supabase SQL Editor)
-- Order: case_questions → user tables → seed data → RLS
-- =============================================================================

-- 1) Case question bank
CREATE TABLE IF NOT EXISTS case_questions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  description TEXT NOT NULL,
  context TEXT,
  key_issues JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2) User diagnosis preferences (Clerk user_id)
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id TEXT PRIMARY KEY,
  recommended_difficulty TEXT CHECK (recommended_difficulty IN ('easy', 'medium', 'hard')),
  diagnosis_completed BOOLEAN NOT NULL DEFAULT FALSE,
  diagnosis_result JSONB,
  learning_progress JSONB DEFAULT '{"section1":{"currentStep":1,"completedSteps":[],"sectionCompleted":false}}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3) Practice history (references case_questions)
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

-- 4) Seed all case questions (6 cases, EN content — UI uses in-app catalog for 中文)
INSERT INTO case_questions (id, title, type, difficulty, description, context, key_issues) VALUES
(
  'retail-profit',
  'Retail chain profit decline',
  'profitability',
  'easy',
  'A retail chain client''s profits have fallen 20% over the past two years while revenue is roughly flat. Diagnose the problem and recommend improvements.',
  'The client operates 500 stores nationwide, mainly FMCG and household goods. Competitors include large supermarkets and e-commerce platforms.',
  '["Revenue mix analysis","Cost structure (fixed vs. variable)","Same-store sales vs. new stores","Category mix shifts","Competitive landscape"]'::jsonb
),
(
  'logistics-cost',
  'Logistics cost optimization',
  'cost_optimization',
  'easy',
  'A regional logistics company''s operating margin fell from 12% to 6% over three years. Find cost drivers and recommend optimizations.',
  'The client runs 40 distribution centers serving B2B retailers. Fuel, labor, and fleet lease are the largest cost buckets.',
  '["Cost waterfall","Fixed vs variable costs","Route and fleet utilization","Warehouse productivity","Quick wins vs structural fixes"]'::jsonb
),
(
  'coffee-china',
  'Coffee brand China market entry',
  'market_entry',
  'medium',
  'A U.S. specialty coffee brand wants to enter China. Assess the market opportunity and outline an entry strategy.',
  'The brand has 200 U.S. stores, premium positioning, ~$7 USD per cup, and no China operations today.',
  '["Market size and growth","Competition (Starbucks, Luckin, etc.)","Consumer insights","Entry mode (WFOE / JV / franchise)","City prioritization"]'::jsonb
),
(
  'streaming-growth',
  'Streaming platform growth strategy',
  'growth_strategy',
  'medium',
  'A mid-size streaming service has plateaued at 8M subscribers. Recommend a growth strategy to reach 15M in 24 months.',
  'Competes with two global giants; strong catalog in documentaries and regional content; ARPU $9/month.',
  '["Growth drivers (acquisition, retention, ARPU)","Customer segmentation","Content investment tradeoffs","Partnership and distribution","Prioritized roadmap"]'::jsonb
),
(
  'pharma-ma',
  'Pharma M&A decision',
  'mergers_acquisitions',
  'hard',
  'Your client, a large pharmaceutical company, is considering acquiring an oncology-focused biotech for $5B. Evaluate whether the deal is worth doing.',
  'The target has 3 pipeline drugs; 1 is in Phase III with expected launch in ~2 years. Current revenue is ~$200M (mostly licensing).',
  '["Strategic fit","Pipeline valuation","Deal valuation","Integration risk","Alternatives"]'::jsonb
),
(
  'ev-market',
  'EV market complex analysis',
  'market_analysis',
  'hard',
  'An auto OEM must allocate $2B across EV platforms for three regions with different regulation, subsidies, and competition.',
  'Europe mandates tighten in 2027; China has price wars; North America IRA credits shift quarterly.',
  '["Market sizing by region","Regulatory and subsidy scenarios","Competitive dynamics","Capability gaps","Portfolio recommendation"]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  type = EXCLUDED.type,
  difficulty = EXCLUDED.difficulty,
  description = EXCLUDED.description,
  context = EXCLUDED.context,
  key_issues = EXCLUDED.key_issues;

-- 5) Row Level Security (service role bypasses; protects direct client access)
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_practice_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_preferences_select_own ON user_preferences;
DROP POLICY IF EXISTS user_preferences_insert_own ON user_preferences;
DROP POLICY IF EXISTS user_preferences_update_own ON user_preferences;
DROP POLICY IF EXISTS user_practice_history_select_own ON user_practice_history;
DROP POLICY IF EXISTS user_practice_history_insert_own ON user_practice_history;

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

-- 6) Case chat session persistence — see scripts/setup-case-session-tables.sql
-- (practice_sessions + chat_messages; uses case_slug, not UUID case_id)
