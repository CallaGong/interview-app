export type LearningStepId = 1 | 2 | 3 | 4;

export interface Section1Progress {
  currentStep: LearningStepId;
  completedSteps: number[];
  step2CorrectCount?: number;
  sectionCompleted: boolean;
}

export interface LearningProgress {
  section1: Section1Progress;
}

export const DEFAULT_LEARNING_PROGRESS: LearningProgress = {
  section1: {
    currentStep: 1,
    completedSteps: [],
    sectionCompleted: false,
  },
};

export function normalizeLearningProgress(raw: unknown): LearningProgress {
  if (!raw || typeof raw !== "object") return DEFAULT_LEARNING_PROGRESS;
  const data = raw as { section1?: Partial<Section1Progress> };
  const s1 = data.section1 ?? {};
  const completedSteps = Array.isArray(s1.completedSteps)
    ? s1.completedSteps.filter((n): n is number => typeof n === "number" && n >= 1 && n <= 4)
    : [];
  const currentStep = ([1, 2, 3, 4] as const).includes(s1.currentStep as LearningStepId)
    ? (s1.currentStep as LearningStepId)
    : 1;

  return {
    section1: {
      currentStep,
      completedSteps,
      step2CorrectCount:
        typeof s1.step2CorrectCount === "number" ? s1.step2CorrectCount : undefined,
      sectionCompleted: Boolean(s1.sectionCompleted),
    },
  };
}

export function getMaxUnlockedStep(_progress: LearningProgress): LearningStepId {
  return 4;
}

/** All steps are always accessible; users can skip ahead without finishing prior steps. */
export function canAccessStep(
  step: LearningStepId,
  progress: LearningProgress
): boolean {
  if (progress.section1.sectionCompleted) return true;
  return step >= 1 && step <= 4;
}

/** Reset Section 1 so the user can study from Step 1 again. */
export function resetSection1Progress(): LearningProgress {
  return { ...DEFAULT_LEARNING_PROGRESS };
}

export function markStepComplete(
  progress: LearningProgress,
  step: LearningStepId
): LearningProgress {
  const completed = new Set(progress.section1.completedSteps);
  completed.add(step);
  const completedSteps = [...completed].sort((a, b) => a - b);
  const nextUnlocked = Math.min(4, step + 1) as LearningStepId;
  const sectionCompleted = step === 4;

  return {
    section1: {
      ...progress.section1,
      completedSteps,
      currentStep: sectionCompleted ? 4 : nextUnlocked,
      sectionCompleted: sectionCompleted || progress.section1.sectionCompleted,
    },
  };
}
