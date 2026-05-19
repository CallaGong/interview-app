-- Align difficulties and add cases for Easy / Medium / Hard coverage

UPDATE case_questions SET difficulty = 'easy' WHERE id = 'retail-profit';

INSERT INTO case_questions (id, title, type, difficulty, description, context, key_issues) VALUES
(
  'logistics-cost',
  'Logistics cost optimization',
  'cost_optimization',
  'easy',
  'A regional logistics company''s operating margin has fallen from 12% to 6% over three years. Identify cost drivers and recommend optimizations.',
  'The client runs 40 distribution centers serving B2B retailers. Fuel, labor, and fleet lease are the largest cost buckets.',
  '["Cost waterfall","Fixed vs variable costs","Route and fleet utilization","Warehouse productivity","Quick wins vs structural fixes"]'::jsonb
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
  'ev-market',
  'EV market complex analysis',
  'market_analysis',
  'hard',
  'An auto OEM must decide how to allocate $2B across EV platforms for three regions with different regulation, subsidies, and competition.',
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
