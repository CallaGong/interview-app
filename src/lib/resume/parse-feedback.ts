import { jsonrepair } from "jsonrepair";
import type { ResumeAnalysisResult, ResumeLocale } from "@/types/resume";
import { normalizeResumeFeedback } from "@/lib/resume/normalize-feedback";

function extractJsonBlock(text: string): string {
  const stripped = text.replace(/```json\n?|\n?```/gi, "").trim();
  const start = stripped.indexOf("{");
  const end = stripped.lastIndexOf("}");
  if (start >= 0 && end > start) {
    return stripped.slice(start, end + 1);
  }
  return stripped;
}

function safeParseJson(text: string): Record<string, unknown> {
  const candidate = extractJsonBlock(text);
  try {
    return JSON.parse(candidate) as Record<string, unknown>;
  } catch {
    return JSON.parse(jsonrepair(candidate)) as Record<string, unknown>;
  }
}

export function parseResumeFeedback(
  raw: string,
  dimensionKeys: string[],
  locale: ResumeLocale = "en"
): ResumeAnalysisResult {
  const parsed = safeParseJson(raw);

  if (
    typeof parsed.overall_score !== "number" ||
    !parsed.dimension_scores ||
    !Array.isArray(parsed.strengths) ||
    !Array.isArray(parsed.suggestions) ||
    !Array.isArray(parsed.quick_wins)
  ) {
    throw new Error("Invalid analysis response shape");
  }

  return normalizeResumeFeedback(parsed, dimensionKeys, locale);
}
