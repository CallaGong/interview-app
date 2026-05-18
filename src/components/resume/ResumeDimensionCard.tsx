"use client";

import { useState } from "react";
import type { ResumeUiCopy } from "@/lib/resume/i18n";
import type { ResumeDimensionInsight } from "@/types/resume";

interface ResumeDimensionCardProps {
  copy: ResumeUiCopy;
  label: string;
  score: number;
  insight: ResumeDimensionInsight;
}

function scoreBarColor(score: number): string {
  if (score >= 8) return "from-emerald-600 to-emerald-400";
  if (score >= 6) return "from-sky-600 to-sky-400";
  if (score >= 4) return "from-amber-600 to-amber-400";
  return "from-rose-600 to-rose-400";
}

export default function ResumeDimensionCard({
  copy,
  label,
  score,
  insight,
}: ResumeDimensionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const pct = Math.min(100, Math.max(0, (score / 10) * 100));

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
        <span className="text-sm font-medium text-white">{label}</span>
        <span className="shrink-0 text-lg font-bold text-sky-400">
          {score.toFixed(1)}
        </span>
      </div>

      <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${scoreBarColor(score)}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="text-xs leading-relaxed text-slate-400">{insight.comment}</p>

      {expanded && (
        <p className="mt-3 border-t border-slate-700/60 pt-3 text-xs leading-relaxed text-slate-300">
          {insight.detail}
        </p>
      )}

      <p className="mt-2 text-[10px] font-medium uppercase tracking-wider text-slate-600">
        {expanded ? copy.tapCollapse : copy.tapExpand}
      </p>
    </button>
  );
}
