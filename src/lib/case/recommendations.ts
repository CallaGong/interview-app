import type { CaseDifficulty, CaseEvaluationScores, CaseQuestion } from "@/types";

export interface PracticeHistoryRow {
  case_id: string;
  difficulty: CaseDifficulty;
  overall_score: number | null;
  completed_at: string;
}

export type RecommendationHint = "upgrade" | "maintain" | "downgrade" | null;

export interface CaseRecommendation {
  difficulty: CaseDifficulty;
  recommendedCaseId: string | null;
  completedCaseIds: string[];
  hint: RecommendationHint;
  averageLastThree: number | null;
}

const DIFFICULTY_ORDER: CaseDifficulty[] = ["easy", "medium", "hard"];

function stepDifficulty(
  current: CaseDifficulty,
  direction: 1 | -1
): CaseDifficulty {
  const idx = DIFFICULTY_ORDER.indexOf(current);
  const next = Math.min(DIFFICULTY_ORDER.length - 1, Math.max(0, idx + direction));
  return DIFFICULTY_ORDER[next];
}

export function computeOverallScore(scores: CaseEvaluationScores): number {
  const values = Object.values(scores);
  const sum = values.reduce((acc, n) => acc + n, 0);
  return Math.round(sum / values.length);
}

/**
 * When practice history exists, use the most recent scored attempt's difficulty
 * as the working level; otherwise fall back to the diagnosis baseline.
 */
export function getWorkingDifficulty(
  diagnosisBase: CaseDifficulty,
  history: PracticeHistoryRow[]
): CaseDifficulty {
  const recentScored = history.filter((row) => row.overall_score != null);
  if (recentScored.length === 0) {
    return diagnosisBase;
  }
  return recentScored[0].difficulty;
}

/** Adjust difficulty from last 3 completed attempts (history overrides diagnosis). */
export function resolveDifficultyFromHistory(
  diagnosisBase: CaseDifficulty,
  history: PracticeHistoryRow[]
): { difficulty: CaseDifficulty; hint: RecommendationHint; averageLastThree: number | null } {
  const scored = history
    .filter((row) => row.overall_score != null)
    .slice(0, 3);

  if (scored.length === 0) {
    return { difficulty: diagnosisBase, hint: null, averageLastThree: null };
  }

  const baseDifficulty = getWorkingDifficulty(diagnosisBase, history);

  const averageLastThree =
    scored.reduce((acc, row) => acc + (row.overall_score as number), 0) / scored.length;

  if (averageLastThree >= 8) {
    const upgraded = stepDifficulty(baseDifficulty, 1);
    return {
      difficulty: upgraded,
      hint: upgraded !== baseDifficulty ? "upgrade" : null,
      averageLastThree,
    };
  }

  if (averageLastThree <= 4) {
    const downgraded = stepDifficulty(baseDifficulty, -1);
    return {
      difficulty: downgraded,
      hint: downgraded !== baseDifficulty ? "downgrade" : null,
      averageLastThree,
    };
  }

  return { difficulty: baseDifficulty, hint: "maintain", averageLastThree };
}

/** Pick next case at difficulty, skipping completed ids. */
export function pickRecommendedCase(
  cases: CaseQuestion[],
  difficulty: CaseDifficulty,
  completedCaseIds: string[]
): string | null {
  const completed = new Set(completedCaseIds);
  const atLevel = cases.filter(
    (c) => c.difficulty === difficulty && !completed.has(c.id)
  );
  if (atLevel.length > 0) return atLevel[0].id;

  const anyUncompleted = cases.filter((c) => !completed.has(c.id));
  if (anyUncompleted.length > 0) return anyUncompleted[0].id;

  return cases[0]?.id ?? null;
}

export function buildCaseRecommendation(params: {
  cases: CaseQuestion[];
  baseDifficulty: CaseDifficulty;
  history: PracticeHistoryRow[];
}): CaseRecommendation {
  const completedCaseIds = [
    ...new Set(params.history.map((row) => row.case_id)),
  ];

  const { difficulty, hint, averageLastThree } = resolveDifficultyFromHistory(
    params.baseDifficulty,
    params.history
  );

  const recommendedCaseId = pickRecommendedCase(
    params.cases,
    difficulty,
    completedCaseIds
  );

  return {
    difficulty,
    recommendedCaseId,
    completedCaseIds,
    hint,
    averageLastThree,
  };
}
