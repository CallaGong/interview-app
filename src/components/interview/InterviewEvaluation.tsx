"use client";

import type { InterviewUiCopy } from "@/lib/interview/i18n";
import type { InterviewEvaluation as InterviewEvaluationType } from "@/types/interview";
import InterviewDimensionCard from "./InterviewDimensionCard";

interface InterviewEvaluationReportProps {
  copy: InterviewUiCopy;
  evaluation: InterviewEvaluationType;
}

function SectionDivider() {
  return <hr className="border-0 border-t border-slate-800" />;
}

function scoreTone(score: number): string {
  if (score >= 8) return "text-emerald-400";
  if (score >= 6) return "text-sky-400";
  if (score >= 4) return "text-amber-400";
  return "text-rose-400";
}

export default function InterviewEvaluationReport({
  copy,
  evaluation,
}: InterviewEvaluationReportProps) {
  return (
    <div className="space-y-10">
      <section aria-labelledby="interview-verdict">
        <p className="mb-4 text-xs font-medium uppercase tracking-widest text-slate-500">
          {copy.verdict}
        </p>
        <div className="rounded-2xl border border-slate-700/60 bg-gradient-to-br from-slate-900/90 to-slate-900/50 p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <h3
                id="interview-verdict"
                className="mb-3 text-lg font-semibold text-white sm:text-xl"
              >
                {copy.overallAssessment}
              </h3>
              <p className="text-base leading-relaxed text-slate-300 sm:text-lg">
                {evaluation.overall_feedback}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-center rounded-2xl border border-slate-700/50 bg-slate-950/60 px-8 py-5 sm:items-end">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {copy.overallScore}
              </span>
              <span
                className={`mt-1 text-5xl font-bold tabular-nums ${scoreTone(evaluation.overall_score)}`}
              >
                {evaluation.overall_score.toFixed(1)}
              </span>
              <span className="text-sm text-slate-500">{copy.scoreOutOf}</span>
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
              <p className="mb-1 text-xs font-medium text-emerald-400">
                {copy.topStrength}
              </p>
              <p className="text-sm text-slate-200">{evaluation.top_strength}</p>
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <p className="mb-1 text-xs font-medium text-amber-400">
                {copy.priorityImprovement}
              </p>
              <p className="text-sm text-slate-200">
                {evaluation.top_improvement}
              </p>
            </div>
          </div>
        </div>
      </section>

      <SectionDivider />

      <section aria-labelledby="interview-diagnosis">
        <p className="mb-4 text-xs font-medium uppercase tracking-widest text-slate-500">
          {copy.diagnosis}
        </p>
        <h3
          id="interview-diagnosis"
          className="mb-5 text-base font-semibold text-white"
        >
          {copy.dimensionBreakdown}
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {evaluation.dimensions.map((dim) => (
            <InterviewDimensionCard
              key={dim.id}
              dimension={dim}
              tapExpand={copy.tapExpand}
              tapCollapse={copy.tapCollapse}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
