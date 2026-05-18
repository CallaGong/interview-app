export type InterviewLocale = "en" | "zh";

export interface InterviewDimensionEvaluation {
  id: string;
  label: string;
  score: number;
  comment: string;
  detail: string;
}

export interface InterviewEvaluation {
  overall_score: number;
  overall_feedback: string;
  top_strength: string;
  top_improvement: string;
  dimensions: InterviewDimensionEvaluation[];
}

export const NEW_QUESTION_MARKER = "[[NEW_QUESTION]]";

export const INTERVIEW_COMPLETE_MARKER = "[[INTERVIEW_COMPLETE]]";
