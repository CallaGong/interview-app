import type { CaseDifficulty } from "@/types";

export type CaseExperience = "none" | "few" | "often";
export type CaseFrameworkKnowledge =
  | "profit_tree"
  | "market_entry"
  | "mergers"
  | "none";
export type MockInterviewExperience = "never" | "yes";

export interface CaseDiagnosisAnswers {
  experience: CaseExperience;
  frameworks: CaseFrameworkKnowledge[];
  mockInterview: MockInterviewExperience;
}

export interface CaseDiagnosisResult {
  answers: CaseDiagnosisAnswers;
  recommendedDifficulty: CaseDifficulty;
  levelLabel: "beginner" | "intermediate" | "experienced";
}

function hasFramework(
  frameworks: CaseFrameworkKnowledge[],
  key: CaseFrameworkKnowledge
): boolean {
  return frameworks.includes(key);
}

/** Map questionnaire answers to recommended difficulty. */
export function diagnoseFromAnswers(
  answers: CaseDiagnosisAnswers
): CaseDiagnosisResult {
  let points = 0;

  if (answers.experience === "few") points += 1;
  if (answers.experience === "often") points += 2;
  if (answers.mockInterview === "yes") points += 1;

  if (hasFramework(answers.frameworks, "profit_tree")) points += 1;
  if (hasFramework(answers.frameworks, "market_entry")) points += 1;
  if (hasFramework(answers.frameworks, "mergers")) points += 1;

  let recommendedDifficulty: CaseDifficulty;
  let levelLabel: CaseDiagnosisResult["levelLabel"];

  if (points <= 1) {
    recommendedDifficulty = "easy";
    levelLabel = "beginner";
  } else if (points <= 4) {
    recommendedDifficulty = "medium";
    levelLabel = "intermediate";
  } else {
    recommendedDifficulty = "hard";
    levelLabel = "experienced";
  }

  return { answers, recommendedDifficulty, levelLabel };
}
