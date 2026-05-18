export type ResumeLocale = "en" | "zh";

export type ResumeDimensionKeyEn =
  | "star_structure"
  | "quantified_impact"
  | "action_verbs"
  | "wording_precision"
  | "consulting_readiness";

export type ResumeDimensionKeyZh =
  | "structure_clarity"
  | "data_support"
  | "project_logic"
  | "professional_expression"
  | "consulting_fit";

export type ResumeDimensionKey = ResumeDimensionKeyEn | ResumeDimensionKeyZh;

export interface ResumeSuggestion {
  original: string;
  suggested: string;
  reason: string;
}

export interface ResumeDimensionInsight {
  comment: string;
  detail: string;
}

export interface ResumeAnalysisResult {
  overall_score: number;
  overall_summary: string;
  dimension_scores: Record<string, number>;
  dimension_insights: Record<string, ResumeDimensionInsight>;
  strengths: string[];
  suggestions: ResumeSuggestion[];
  quick_wins: string[];
}

export const RESUME_DIMENSION_LABELS_EN: Record<ResumeDimensionKeyEn, string> = {
  star_structure: "STAR structure",
  quantified_impact: "Quantified impact",
  action_verbs: "Action verbs",
  wording_precision: "Wording precision",
  consulting_readiness: "MBB readiness",
};

export const RESUME_DIMENSION_LABELS_ZH: Record<ResumeDimensionKeyZh, string> = {
  structure_clarity: "结构清晰度",
  data_support: "数据支撑",
  project_logic: "项目叙述逻辑",
  professional_expression: "表达专业性",
  consulting_fit: "咨询匹配度",
};

export const RESUME_DIMENSION_KEYS_EN: ResumeDimensionKeyEn[] = [
  "star_structure",
  "quantified_impact",
  "action_verbs",
  "wording_precision",
  "consulting_readiness",
];

export const RESUME_DIMENSION_KEYS_ZH: ResumeDimensionKeyZh[] = [
  "structure_clarity",
  "data_support",
  "project_logic",
  "professional_expression",
  "consulting_fit",
];
