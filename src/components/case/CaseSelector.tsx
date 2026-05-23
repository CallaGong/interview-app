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
  onPractice: (c: CaseQuestion) => void;
  onLive: (c: CaseQuestion) => void;
  disabled?: boolean;
  locale?: CaseLocale;
  recommendedCaseId?: string | null;
  activeDifficulty?: DifficultyFilter;
  onDifficultyChange?: (filter: DifficultyFilter) => void;
}

export default function CaseSelector({
  cases,
  selected,
  onPractice,
  onLive,
  disabled,
  locale = "en",
  recommendedCaseId,
  activeDifficulty = "all",
  onDifficultyChange,
}: CaseSelectorProps) {
  const filters: DifficultyFilter[] = ["all", "easy", "medium", "hard"];
  const c =
    locale === "zh"
      ? {
          all: "全部",
          recommended: "推荐",
          practice: "📝 练习模式",
          live: "🎯 Live 模式",
          comingSoon: "即将推出",
        }
      : {
          all: "All",
          recommended: "Recommended",
          practice: "📝 Practice Mode",
          live: "🎯 Live Mode",
          comingSoon: "Coming soon",
        };

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
            const liveEnabled = item.supports_live_mode === true;

            return (
              <div
                key={item.id}
                className={`relative flex flex-col rounded-xl border p-4 transition ${
                  isRecommended
                    ? "border-amber-400/70 bg-amber-500/10 ring-2 ring-amber-400/40"
                    : isSelected
                      ? "border-sky-500/60 bg-sky-500/10 ring-1 ring-sky-500/40"
                      : "border-slate-700/80 bg-slate-900/60"
                } ${disabled ? "opacity-60" : ""}`}
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
                <h3 className="mb-1 text-sm font-semibold text-white">
                  {item.title}
                </h3>
                <p className="mb-3 line-clamp-2 flex-1 text-xs text-slate-400">
                  {item.description}
                </p>
                <div className="mt-auto flex flex-col gap-2">
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onPractice(item)}
                    className="w-full rounded-lg bg-slate-800 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed"
                  >
                    {c.practice}
                  </button>
                  <div className="relative group">
                    <button
                      type="button"
                      disabled={disabled || !liveEnabled}
                      onClick={() => liveEnabled && onLive(item)}
                      className={`w-full rounded-lg py-2 text-sm font-medium transition disabled:cursor-not-allowed ${
                        liveEnabled
                          ? "bg-rose-600 text-white hover:bg-rose-500"
                          : "bg-slate-800/80 text-slate-500"
                      }`}
                    >
                      {c.live}
                    </button>
                    {!liveEnabled && (
                      <span className="pointer-events-none absolute -top-8 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded bg-slate-700 px-2 py-1 text-[10px] text-slate-200 group-hover:block">
                        {c.comingSoon}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
