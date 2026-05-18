import { jsonrepair } from "jsonrepair";
import type { InterviewEvaluation } from "@/types/interview";

function extractJsonBlock(text: string): string {
  const stripped = text.replace(/```json\n?|\n?```/gi, "").trim();
  const start = stripped.indexOf("{");
  const end = stripped.lastIndexOf("}");
  if (start >= 0 && end > start) {
    return stripped.slice(start, end + 1);
  }
  return stripped;
}

export function parseInterviewEvaluation(raw: string): InterviewEvaluation {
  const candidate = extractJsonBlock(raw);
  let parsed: InterviewEvaluation;
  try {
    parsed = JSON.parse(candidate) as InterviewEvaluation;
  } catch {
    parsed = JSON.parse(jsonrepair(candidate)) as InterviewEvaluation;
  }

  if (
    typeof parsed.overall_score !== "number" ||
    !Array.isArray(parsed.dimensions) ||
    typeof parsed.overall_feedback !== "string" ||
    typeof parsed.top_strength !== "string" ||
    typeof parsed.top_improvement !== "string"
  ) {
    throw new Error("Invalid interview evaluation shape");
  }

  return parsed;
}

export function tryParseInterviewEvaluation(
  content: string
): InterviewEvaluation | null {
  try {
    return parseInterviewEvaluation(content);
  } catch {
    return null;
  }
}
