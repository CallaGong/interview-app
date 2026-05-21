ALTER TABLE user_preferences
  ADD COLUMN IF NOT EXISTS learning_progress JSONB DEFAULT '{"section1":{"currentStep":1,"completedSteps":[],"sectionCompleted":false}}'::jsonb;
