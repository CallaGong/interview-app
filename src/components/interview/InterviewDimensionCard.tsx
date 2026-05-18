"use client";

import { useState } from "react";
import type { InterviewDimensionEvaluation } from "@/types/interview";

function scoreBarColor(score: number): string {
  if (score >= 8) return "from-emerald-600 to-emerald-400";
  if (score >= 6) return "from-sky-600 to-sky-400";
  if (score >= 4) return "from-amber-600 to-amber-400";
  return "from-rose-600 to-rose-400";
}

interface InterviewDimensionCardProps {
  dimension: InterviewDimensionEvaluation;
  tapExpand: string;
  tapCollapse: string;
}

export default function InterviewDimensionCard({
  dimension,
  tapExpand,
  tapCollapse,
}: InterviewDimensionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const pct = Math.min(100, Math.max(0, (dimension.score / 10) * 100));

  return (
    <button
      type="button"
      onClick={() => setExpanded((v) => !v)}
      className={`w-full rounded-xl border p-4 text-left transition ${
        expanded
          ? "border-sky-500/40 bg-sky-500/5 ring-1 ring-sky-500/20"
          : "border-slate-700/80 bg-slate-900/60 hover:border-slate-600 hover:bg-slate-800/50"
      }`}
      aria-expanded={expanded}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <span className="text-sm font-medium text-white">{dimension.label}</span>
        <span className="shrink-0 text-lg font-bold text-sky-400">
          {dimension.score.toFixed(1)}
        </span>
      </div>

      <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${scoreBarColor(dimension.score)}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="text-xs leading-relaxed text-slate-400">
        {dimension.comment}
      </p>

      {expanded && (
        <p className="mt-3 border-t border-slate-700/60 pt-3 text-xs leading-relaxed text-slate-300">
          {dimension.detail}
        </p>
      )}

      <p className="mt-2 text-[10px] font-medium uppercase tracking-wider text-slate-600">
        {expanded ? tapCollapse : tapExpand}
      </p>
    </button>
  );
}
