"use client";

import { difficultyLabel } from "@/lib/case/i18n";
import type { CaseLocale } from "@/types/case-locale";
import type { CaseDifficulty, CaseQuestion } from "@/types";

const difficultyColor: Record<CaseDifficulty, string> = {
  easy: "bg-emerald-500/20 text-emerald-300",
  medium: "bg-amber-500/20 text-amber-300",
  hard: "bg-rose-500/20 text-rose-300",
};

type DifficultyFilter = "all" | CaseDifficulty;

interface CaseSelectorProps {
  cases: CaseQuestion[];
  selected: CaseQuestion | null;
  onSelect: (c: CaseQuestion) => void;
  disabled?: boolean;
  locale?: CaseLocale;
  recommendedCaseId?: string | null;
  activeDifficulty?: DifficultyFilter;
  onDifficultyChange?: (filter: DifficultyFilter) => void;
}

export default function CaseSelector({
  cases,
  selected,
  onSelect,
  disabled,
  locale = "en",
  recommendedCaseId,
  activeDifficulty = "all",
  onDifficultyChange,
}: CaseSelectorProps) {
  const filters: DifficultyFilter[] = ["all", "easy", "medium", "hard"];
  const c = locale === "zh"
    ? { all: "全部", recommended: "推荐" }
    : { all: "All", recommended: "Recommended" };

  const filtered =
    activeDifficulty === "all"
      ? cases
      : cases.filter((item) => item.difficulty === activeDifficulty);

  return (
    <div className="space-y-4">
      {onDifficultyChange && (
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => {
            const label =
              filter === "all"
                ? c.all
                : difficultyLabel(locale, filter);
            const isActive = activeDifficulty === filter;
            return (
              <button
                key={filter}
                type="button"
                onClick={() => onDifficultyChange(filter)}
                className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-sky-600 text-white"
                    : "border border-slate-700 text-slate-400 hover:border-slate-600 hover:text-white"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-sm text-slate-500">
          {locale === "zh" ? "该难度暂无题目。" : "No cases at this difficulty."}
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => {
            const isSelected = selected?.id === item.id;
            const isRecommended = recommendedCaseId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                disabled={disabled}
                onClick={() => onSelect(item)}
                className={`relative rounded-xl border p-4 text-left transition ${
                  isRecommended
                    ? "border-amber-400/70 bg-amber-500/10 ring-2 ring-amber-400/40"
                    : isSelected
                      ? "border-sky-500/60 bg-sky-500/10 ring-1 ring-sky-500/40"
                      : "border-slate-700/80 bg-slate-900/60 hover:border-slate-600 hover:bg-slate-800/60"
                } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
              >
                {isRecommended && (
                  <span className="absolute right-3 top-3 rounded-full bg-amber-500/25 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-200">
                    {c.recommended}
                  </span>
                )}
                <div className="mb-2 flex items-center justify-between gap-2 pr-16">
                  <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {item.type.replace(/_/g, " ")}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${difficultyColor[item.difficulty]}`}
                  >
                    {difficultyLabel(locale, item.difficulty)}
                  </span>
                </div>
                <h3 className="mb-1 text-sm font-semibold text-white">{item.title}</h3>
                <p className="line-clamp-2 text-xs text-slate-400">{item.description}</p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
