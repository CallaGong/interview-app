import type { ResumeLocale } from "@/types/resume";
import type { ResumeAnalysisResult, ResumeDimensionInsight } from "@/types/resume";
import { RESUME_DIMENSION_LABELS_EN, RESUME_DIMENSION_LABELS_ZH } from "@/types/resume";

function scoreComment(score: number, locale: ResumeLocale): string {
  if (locale === "zh") {
    if (score >= 8) return "表现优秀，达到咨询行业要求";
    if (score >= 6) return "基本合格，仍有提升空间";
    if (score >= 4) return "存在明显不足，建议重点修改";
    return "较弱，需优先改进";
  }
  if (score >= 8) return "Strong — meets consulting bar";
  if (score >= 6) return "Adequate — room to sharpen";
  if (score >= 4) return "Needs work — visible gaps";
  return "Weak — prioritize fixes";
}

function scoreDetail(score: number, label: string, locale: ResumeLocale): string {
  if (locale === "zh") {
    if (score >= 8) {
      return `「${label}」是这份简历的相对优势，投递不同公司时可保持同等表述质量。`;
    }
    if (score >= 6) {
      return `「${label}」尚可但不够突出，建议补充具体数据与咨询语境，以增强竞争力。`;
    }
    return `「${label}」拖累了整体印象，建议重写相关要点：结构更清晰、成果可量化、用语更专业。`;
  }
  if (score >= 8) {
    return `${label} is a relative strength. Keep the same rigor when tailoring for each firm.`;
  }
  if (score >= 6) {
    return `${label} is acceptable but not distinctive. Tighten bullets and add specifics to stand out in a competitive pool.`;
  }
  return `${label} is holding the resume back. Revise bullets with clearer structure, metrics, and consulting language.`;
}

function dimensionLabel(key: string, locale: ResumeLocale): string {
  if (locale === "zh") {
    const zh = RESUME_DIMENSION_LABELS_ZH as Record<string, string>;
    return zh[key] ?? key;
  }
  const en = RESUME_DIMENSION_LABELS_EN as Record<string, string>;
  return en[key] ?? key.replace(/_/g, " ");
}

export function normalizeResumeFeedback(
  raw: Record<string, unknown>,
  dimensionKeys: string[],
  locale: ResumeLocale = "en"
): ResumeAnalysisResult {
  const overall_score = raw.overall_score as number;
  const dimension_scores = (raw.dimension_scores ?? {}) as Record<string, number>;
  const strengths = (raw.strengths ?? []) as string[];
  const suggestions = (raw.suggestions ?? []) as ResumeAnalysisResult["suggestions"];
  const quick_wins = (raw.quick_wins ?? []) as string[];

  const rawInsights = (raw.dimension_insights ?? {}) as Record<
    string,
    Partial<ResumeDimensionInsight>
  >;

  const dimension_insights: Record<string, ResumeDimensionInsight> = {};
  for (const key of dimensionKeys) {
    const score = dimension_scores[key] ?? 5;
    const label = dimensionLabel(key, locale);
    const fromApi = rawInsights[key];
    dimension_insights[key] = {
      comment: fromApi?.comment?.trim() || scoreComment(score, locale),
      detail:
        fromApi?.detail?.trim() || scoreDetail(score, label, locale),
    };
  }

  const defaultSummaryZh =
    overall_score >= 7.5
      ? "整体达到国内顶尖咨询公司简历水准，稍作打磨即可投递。"
      : overall_score >= 6
        ? "基础不错，针对性修改后可显著提升竞争力。"
        : "距典型咨询简历标准仍有差距，建议优先优化结构、数据与项目叙述。";

  const defaultSummaryEn =
    overall_score >= 7.5
      ? "Solid consulting resume with minor polish needed."
      : overall_score >= 6
        ? "Competitive base — targeted edits can lift impact."
        : "Below typical consulting bar — focus on structure, metrics, and narrative.";

  const overall_summary =
    typeof raw.overall_summary === "string" && raw.overall_summary.trim()
      ? raw.overall_summary.trim()
      : strengths[0] ||
        (locale === "zh" ? defaultSummaryZh : defaultSummaryEn);

  return {
    overall_score,
    overall_summary,
    dimension_scores,
    dimension_insights,
    strengths,
    suggestions,
    quick_wins,
  };
}
