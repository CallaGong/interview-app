export type CaseDifficulty = "easy" | "medium" | "hard";

export interface CaseQuestion {
  id: string;
  title: string;
  type: string;
  difficulty: CaseDifficulty;
  description: string;
  context: string;
  key_issues: string[];
  supports_live_mode?: boolean;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface CaseEvaluationScores {
  framework: number;
  hypothesis: number;
  quantitative: number;
  communication: number;
  recommendation: number;
}

export interface CaseEvaluation {
  scores: CaseEvaluationScores;
  covered_issues: string[];
  missed_issues: string[];
  feedback: string;
  top_strength: string;
  top_improvement: string;
}
