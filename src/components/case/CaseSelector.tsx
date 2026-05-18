"use client";

import type { CaseLocale } from "@/types/case-locale";
import type { CaseQuestion } from "@/types";

const difficultyLabelEn: Record<CaseQuestion["difficulty"], string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

const difficultyLabelZh: Record<CaseQuestion["difficulty"], string> = {
  easy: "简单",
  medium: "中等",
  hard: "困难",
};

const difficultyColor: Record<CaseQuestion["difficulty"], string> = {
  easy: "bg-emerald-500/20 text-emerald-300",
  medium: "bg-amber-500/20 text-amber-300",
  hard: "bg-rose-500/20 text-rose-300",
};

interface CaseSelectorProps {
  cases: CaseQuestion[];
  selected: CaseQuestion | null;
  onSelect: (c: CaseQuestion) => void;
  disabled?: boolean;
  locale?: CaseLocale;
}

export default function CaseSelector({
  cases,
  selected,
  onSelect,
  disabled,
  locale = "en",
}: CaseSelectorProps) {
  const difficultyLabel = locale === "zh" ? difficultyLabelZh : difficultyLabelEn;

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {cases.map((c) => {
        const isSelected = selected?.id === c.id;
        return (
          <button
            key={c.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(c)}
            className={`rounded-xl border p-4 text-left transition ${
              isSelected
                ? "border-sky-500/60 bg-sky-500/10 ring-1 ring-sky-500/40"
                : "border-slate-700/80 bg-slate-900/60 hover:border-slate-600 hover:bg-slate-800/60"
            } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {c.type.replace("_", " ")}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${difficultyColor[c.difficulty]}`}
              >
                {difficultyLabel[c.difficulty]}
              </span>
            </div>
            <h3 className="mb-1 text-sm font-semibold text-white">{c.title}</h3>
            <p className="line-clamp-2 text-xs text-slate-400">{c.description}</p>
          </button>
        );
      })}
    </div>
  );
}
