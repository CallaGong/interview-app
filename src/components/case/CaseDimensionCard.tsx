"use client";

function scoreBarColor(score: number): string {
  if (score >= 8) return "from-emerald-600 to-emerald-400";
  if (score >= 6) return "from-sky-600 to-sky-400";
  if (score >= 4) return "from-amber-600 to-amber-400";
  return "from-rose-600 to-rose-400";
}

function scoreTextColor(score: number): string {
  if (score >= 8) return "text-emerald-400";
  if (score >= 6) return "text-sky-400";
  if (score >= 4) return "text-amber-400";
  return "text-rose-400";
}

interface CaseDimensionCardProps {
  label: string;
  score: number;
}

export default function CaseDimensionCard({ label, score }: CaseDimensionCardProps) {
  const pct = Math.min(100, Math.max(0, (score / 10) * 100));

  return (
    <div className="rounded-xl border border-slate-700/80 bg-slate-900/60 p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <span className="text-sm font-medium text-white">{label}</span>
        <span className={`shrink-0 text-lg font-bold tabular-nums ${scoreTextColor(score)}`}>
          {score.toFixed(1)}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${scoreBarColor(score)}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
