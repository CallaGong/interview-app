"use client";

import type { ResumeUiCopy } from "@/lib/resume/i18n";
import type { ResumeAnalysisResult } from "@/types/resume";
import ResumeDimensionCard from "./ResumeDimensionCard";

interface ResumeResultsProps {
  copy: ResumeUiCopy;
  result: ResumeAnalysisResult;
  dimensionKeys: string[];
  dimensionLabels: Record<string, string>;
  standardLabel: string;
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

export default function ResumeResults({
  copy,
  result,
  dimensionKeys,
  dimensionLabels,
  standardLabel,
}: ResumeResultsProps) {
  const topQuickWins = result.quick_wins.slice(0, 3);

  return (
    <div className="space-y-10">
      <section aria-labelledby="resume-verdict">
        <p className="mb-4 text-xs font-medium uppercase tracking-widest text-slate-500">
          {copy.verdict}
        </p>
        <div className="rounded-2xl border border-slate-700/60 bg-gradient-to-br from-slate-900/90 to-slate-900/50 p-6 sm:p-8">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-sky-400/80">
            {standardLabel}
          </p>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <h3
                id="resume-verdict"
                className="mb-3 text-lg font-semibold text-white sm:text-xl"
              >
                {copy.overallAssessment}
              </h3>
              <p className="text-base leading-relaxed text-slate-300 sm:text-lg">
                {result.overall_summary}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-center rounded-2xl border border-slate-700/50 bg-slate-950/60 px-8 py-5 sm:items-end">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {copy.totalScore}
              </span>
              <span
                className={`mt-1 text-5xl font-bold tabular-nums ${scoreTone(result.overall_score)}`}
              >
                {result.overall_score.toFixed(1)}
              </span>
              <span className="text-sm text-slate-500">{copy.scoreOutOf}</span>
            </div>
          </div>
        </div>
      </section>

      <SectionDivider />

      <section aria-labelledby="resume-diagnosis">
        <p className="mb-4 text-xs font-medium uppercase tracking-widest text-slate-500">
          {copy.diagnosis}
        </p>
        <h3
          id="resume-diagnosis"
          className="mb-5 text-base font-semibold text-white"
        >
          {copy.dimensionBreakdown}
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {dimensionKeys.map((key) => (
            <ResumeDimensionCard
              key={key}
              copy={copy}
              label={dimensionLabels[key] ?? key}
              score={result.dimension_scores[key] ?? 0}
              insight={
                result.dimension_insights[key] ?? {
                  comment: "—",
                  detail: copy.noDetail,
                }
              }
            />
          ))}
        </div>
      </section>

      <SectionDivider />

      <section aria-labelledby="resume-actions">
        <p className="mb-4 text-xs font-medium uppercase tracking-widest text-slate-500">
          {copy.action}
        </p>
        <h3
          id="resume-actions"
          className="mb-5 text-base font-semibold text-white"
        >
          {copy.whatNext}
        </h3>

        {topQuickWins.length > 0 && (
          <div className="mb-8">
            <p className="mb-3 text-sm font-medium text-emerald-400">
              {copy.quickWinsTitle}
            </p>
            <ul className="space-y-3">
              {topQuickWins.map((item, i) => (
                <li
                  key={i}
                  className="flex min-w-0 items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-300">
                    {i + 1}
                  </span>
                  <span className="min-w-0 text-sm leading-relaxed text-emerald-50/90 [overflow-wrap:anywhere] break-words">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {result.suggestions.length > 0 && (
          <div>
            <p className="mb-4 text-sm font-medium text-slate-400">
              {copy.detailedSuggestions}
            </p>
            <div className="space-y-5">
              {result.suggestions.map((s, i) => (
                <article
                  key={i}
                  className="overflow-hidden rounded-xl border border-slate-700/60 bg-slate-900/50"
                >
                  <div className="border-b border-slate-800/80 bg-rose-500/5 px-4 py-3 sm:px-5">
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-rose-400/90">
                      {copy.original}
                    </p>
                    <p className="text-sm leading-relaxed text-rose-100/70 [overflow-wrap:anywhere] break-words">
                      {s.original}
                    </p>
                  </div>
                  <div className="border-b border-slate-800/80 bg-sky-500/5 px-4 py-3 sm:px-5">
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-sky-400/90">
                      {copy.suggested}
                    </p>
                    <p className="text-sm leading-relaxed text-sky-50/90 [overflow-wrap:anywhere] break-words">
                      {s.suggested}
                    </p>
                  </div>
                  <div className="bg-slate-950/40 px-4 py-3 sm:px-5">
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-amber-400/80">
                      {copy.reason}
                    </p>
                    <p className="text-sm leading-relaxed text-slate-400 [overflow-wrap:anywhere] break-words">
                      {s.reason}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
