"use client";

import type { CaseLocale } from "@/types/case-locale";
import type { CaseEvaluation as CaseEvaluationType } from "@/types";

interface CaseEvaluationProps {
  evaluation: CaseEvaluationType;
  locale?: CaseLocale;
}

const scoreLabelsEn: Record<keyof CaseEvaluationType["scores"], string> = {
  framework: "Framework",
  hypothesis: "Hypothesis-driven",
  quantitative: "Quantitative",
  communication: "Communication",
  recommendation: "Recommendation",
};

const scoreLabelsZh: Record<keyof CaseEvaluationType["scores"], string> = {
  framework: "框架完整性",
  hypothesis: "假设驱动",
  quantitative: "定量分析",
  communication: "表达清晰度",
  recommendation: "建议质量",
};

export default function CaseEvaluation({
  evaluation,
  locale = "en",
}: CaseEvaluationProps) {
  const { scores } = evaluation;
  const scoreLabels = locale === "zh" ? scoreLabelsZh : scoreLabelsEn;
  const t =
    locale === "zh"
      ? {
          title: "评估报告",
          strength: "最突出优点",
          improvement: "优先改进",
          covered: "已覆盖要点",
          missed: "遗漏要点",
        }
      : {
          title: "Evaluation report",
          strength: "Top strength",
          improvement: "Priority improvement",
          covered: "Covered issues",
          missed: "Missed issues",
        };

  return (
    <div className="min-w-0 max-w-full overflow-hidden rounded-xl border border-slate-700/80 bg-slate-900/80 p-4 sm:p-6">
      <h3 className="mb-4 text-lg font-semibold text-white">{t.title}</h3>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {(Object.keys(scores) as (keyof typeof scores)[]).map((key) => (
          <div key={key} className="min-w-0 rounded-lg bg-slate-800/80 p-3 text-center">
            <div className="text-2xl font-bold text-sky-400">{scores[key]}</div>
            <div className="mt-1 break-words text-xs text-slate-400">{scoreLabels[key]}</div>
          </div>
        ))}
      </div>

      <p className="mb-4 [overflow-wrap:anywhere] break-words text-sm leading-relaxed text-slate-300">
        {evaluation.feedback}
      </p>

      <div className="mb-4 grid min-w-0 gap-4 sm:grid-cols-2">
        <div className="min-w-0 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
          <p className="mb-1 text-xs font-medium text-emerald-400">{t.strength}</p>
          <p className="[overflow-wrap:anywhere] break-words text-sm text-slate-200">
            {evaluation.top_strength}
          </p>
        </div>
        <div className="min-w-0 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
          <p className="mb-1 text-xs font-medium text-amber-400">{t.improvement}</p>
          <p className="[overflow-wrap:anywhere] break-words text-sm text-slate-200">
            {evaluation.top_improvement}
          </p>
        </div>
      </div>

      <div className="grid min-w-0 gap-4 sm:grid-cols-2">
        <div className="min-w-0">
          <p className="mb-2 text-xs font-medium text-slate-500">{t.covered}</p>
          <ul className="space-y-1">
            {evaluation.covered_issues.map((item, i) => (
              <li key={i} className="flex min-w-0 items-start gap-2 text-sm text-slate-300">
                <span className="shrink-0 text-emerald-400">✓</span>
                <span className="min-w-0 [overflow-wrap:anywhere] break-words">{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="min-w-0">
          <p className="mb-2 text-xs font-medium text-slate-500">{t.missed}</p>
          <ul className="space-y-1">
            {evaluation.missed_issues.map((item, i) => (
              <li key={i} className="flex min-w-0 items-start gap-2 text-sm text-slate-300">
                <span className="shrink-0 text-rose-400">○</span>
                <span className="min-w-0 [overflow-wrap:anywhere] break-words">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
