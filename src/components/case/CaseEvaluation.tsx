"use client";

import { getCaseEvaluationOverallScore } from "@/lib/case/parse-evaluation";
import type { CaseLocale } from "@/types/case-locale";
import type { CaseEvaluation as CaseEvaluationType, CaseEvaluationScores } from "@/types";
import CaseDimensionCard from "./CaseDimensionCard";

interface CaseEvaluationProps {
  evaluation: CaseEvaluationType;
  locale?: CaseLocale;
}

const SCORE_KEYS: (keyof CaseEvaluationScores)[] = [
  "framework",
  "hypothesis",
  "quantitative",
  "communication",
  "recommendation",
];

const scoreLabelsEn: Record<keyof CaseEvaluationScores, string> = {
  framework: "Framework",
  hypothesis: "Hypothesis-driven",
  quantitative: "Quantitative",
  communication: "Communication",
  recommendation: "Recommendation",
};

const scoreLabelsZh: Record<keyof CaseEvaluationScores, string> = {
  framework: "框架完整性",
  hypothesis: "假设驱动",
  quantitative: "定量分析",
  communication: "表达清晰度",
  recommendation: "建议质量",
};

function SectionDivider() {
  return <hr className="border-0 border-t border-slate-800" />;
}

function scoreTone(score: number): string {
  if (score >= 8) return "text-emerald-400";
  if (score >= 6) return "text-sky-400";
  if (score >= 4) return "text-amber-400";
  return "text-rose-400";
}

export default function CaseEvaluation({
  evaluation,
  locale = "en",
}: CaseEvaluationProps) {
  const { scores } = evaluation;
  const scoreLabels = locale === "zh" ? scoreLabelsZh : scoreLabelsEn;
  const overallScore = getCaseEvaluationOverallScore(evaluation);

  const t =
    locale === "zh"
      ? {
          verdict: "总评",
          overallAssessment: "整体表现",
          scoreSubtitle: "各维度平均分",
          totalScore: "总分",
          scoreOutOf: "/ 10",
          diagnosis: "维度诊断",
          dimensionBreakdown: "各维度得分",
          covered: "已覆盖关键点",
          missed: "遗漏关键点",
          feedbackTitle: "整体评价",
          strength: "最突出优点",
          improvement: "最需改进",
          noCovered: "暂无",
          noMissed: "暂无",
        }
      : {
          verdict: "Verdict",
          overallAssessment: "Overall performance",
          scoreSubtitle: "Average across five dimensions",
          totalScore: "Overall score",
          scoreOutOf: "/ 10",
          diagnosis: "Diagnosis",
          dimensionBreakdown: "Dimension scores",
          covered: "Covered key issues",
          missed: "Missed key issues",
          feedbackTitle: "Overall feedback",
          strength: "Top strength",
          improvement: "Priority improvement",
          noCovered: "None listed",
          noMissed: "None listed",
        };

  return (
    <div className="space-y-8">
      <section aria-labelledby="case-verdict">
        <p className="mb-4 text-xs font-medium uppercase tracking-widest text-slate-500">
          {t.verdict}
        </p>
        <div className="rounded-2xl border border-slate-700/60 bg-gradient-to-br from-slate-900/90 to-slate-900/50 p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <h3
                id="case-verdict"
                className="mb-1 text-lg font-semibold text-white sm:text-xl"
              >
                {t.overallAssessment}
              </h3>
              <p className="text-sm text-slate-500">{t.scoreSubtitle}</p>
            </div>
            <div className="flex shrink-0 flex-col items-center rounded-2xl border border-slate-700/50 bg-slate-950/60 px-8 py-5 sm:items-end">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {t.totalScore}
              </span>
              <span
                className={`mt-1 text-5xl font-bold tabular-nums ${scoreTone(overallScore)}`}
              >
                {overallScore.toFixed(1)}
              </span>
              <span className="text-sm text-slate-500">{t.scoreOutOf}</span>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
              <p className="mb-1 text-xs font-medium text-emerald-400">{t.strength}</p>
              <p className="text-sm leading-relaxed text-slate-200">
                {evaluation.top_strength || "—"}
              </p>
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <p className="mb-1 text-xs font-medium text-amber-400">{t.improvement}</p>
              <p className="text-sm leading-relaxed text-slate-200">
                {evaluation.top_improvement || "—"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <SectionDivider />

      <section aria-labelledby="case-diagnosis">
        <p className="mb-4 text-xs font-medium uppercase tracking-widest text-slate-500">
          {t.diagnosis}
        </p>
        <h3 id="case-diagnosis" className="mb-5 text-base font-semibold text-white">
          {t.dimensionBreakdown}
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SCORE_KEYS.map((key) => (
            <CaseDimensionCard
              key={key}
              label={scoreLabels[key]}
              score={scores[key]}
            />
          ))}
        </div>
      </section>

      <SectionDivider />

      <section className="grid min-w-0 gap-6 lg:grid-cols-2">
        <div>
          <p className="mb-3 text-sm font-medium text-emerald-400">{t.covered}</p>
          <div className="flex flex-wrap gap-2">
            {evaluation.covered_issues.length > 0 ? (
              evaluation.covered_issues.map((item, i) => (
                <span
                  key={`${item}-${i}`}
                  className="inline-flex max-w-full rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-100 [overflow-wrap:anywhere]"
                >
                  {item}
                </span>
              ))
            ) : (
              <span className="text-sm text-slate-500">{t.noCovered}</span>
            )}
          </div>
        </div>
        <div>
          <p className="mb-3 text-sm font-medium text-rose-400">{t.missed}</p>
          <div className="flex flex-wrap gap-2">
            {evaluation.missed_issues.length > 0 ? (
              evaluation.missed_issues.map((item, i) => (
                <span
                  key={`${item}-${i}`}
                  className="inline-flex max-w-full rounded-full border border-rose-500/40 bg-rose-500/15 px-3 py-1 text-xs font-medium text-rose-100 [overflow-wrap:anywhere]"
                >
                  {item}
                </span>
              ))
            ) : (
              <span className="text-sm text-slate-500">{t.noMissed}</span>
            )}
          </div>
        </div>
      </section>

      {evaluation.feedback ? (
        <>
          <SectionDivider />
          <section>
            <p className="mb-3 text-xs font-medium uppercase tracking-widest text-slate-500">
              {t.feedbackTitle}
            </p>
            <p className="rounded-xl border border-slate-700/60 bg-slate-900/50 p-5 text-sm leading-relaxed text-slate-300 sm:text-base">
              {evaluation.feedback}
            </p>
          </section>
        </>
      ) : null}
    </div>
  );
}
