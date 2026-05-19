import { jsonrepair } from "jsonrepair";
import { computeOverallScore } from "@/lib/case/recommendations";
import type { CaseEvaluation, CaseEvaluationScores } from "@/types";

const SCORE_KEYS: (keyof CaseEvaluationScores)[] = [
  "framework",
  "hypothesis",
  "quantitative",
  "communication",
  "recommendation",
];

function extractJsonBlock(text: string): string {
  const stripped = text.replace(/```json\n?|\n?```/gi, "").trim();
  const start = stripped.indexOf("{");
  const end = stripped.lastIndexOf("}");
  if (start >= 0 && end > start) {
    return stripped.slice(start, end + 1);
  }
  return stripped;
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    return Number.isNaN(n) ? null : n;
  }
  return null;
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === "string" && value.trim()) {
    return [value.trim()];
  }
  return [];
}

function normalizeScores(raw: unknown): CaseEvaluationScores | null {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Record<string, unknown>;
  const scores = {} as CaseEvaluationScores;

  for (const key of SCORE_KEYS) {
    const n = toNumber(record[key]);
    if (n === null) return null;
    scores[key] = Math.min(10, Math.max(0, Math.round(n * 10) / 10));
  }

  return scores;
}

function normalizeEvaluation(raw: Record<string, unknown>): CaseEvaluation {
  const scores = normalizeScores(raw.scores);
  if (!scores) {
    throw new Error("Invalid case evaluation scores");
  }

  return {
    scores,
    covered_issues: toStringArray(raw.covered_issues ?? raw.coveredIssues),
    missed_issues: toStringArray(raw.missed_issues ?? raw.missedIssues),
    feedback: String(raw.feedback ?? "").trim(),
    top_strength: String(raw.top_strength ?? raw.topStrength ?? "").trim(),
    top_improvement: String(
      raw.top_improvement ?? raw.topImprovement ?? ""
    ).trim(),
  };
}

export function parseCaseEvaluation(raw: string): CaseEvaluation {
  const candidate = extractJsonBlock(raw);
  let parsed: Record<string, unknown>;

  try {
    parsed = JSON.parse(candidate) as Record<string, unknown>;
  } catch {
    parsed = JSON.parse(jsonrepair(candidate)) as Record<string, unknown>;
  }

  return normalizeEvaluation(parsed);
}

export function tryParseCaseEvaluation(content: string): CaseEvaluation | null {
  try {
    return parseCaseEvaluation(content);
  } catch {
    return null;
  }
}

export function getCaseEvaluationOverallScore(evaluation: CaseEvaluation): number {
  return computeOverallScore(evaluation.scores);
}
