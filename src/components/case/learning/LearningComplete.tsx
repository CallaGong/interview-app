"use client";

import { getLearningUi } from "@/lib/case/learning/i18n";
import type { CaseLocale } from "@/types/case-locale";

interface LearningCompleteProps {
  locale: CaseLocale;
  onStartPractice: () => void;
  onReview: () => void;
}

export default function LearningComplete({
  locale,
  onStartPractice,
  onReview,
}: LearningCompleteProps) {
  const ui = getLearningUi(locale);

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-slate-700/80 bg-gradient-to-br from-slate-900/90 to-slate-900/50 p-8 text-center sm:p-12">
      <p className="text-4xl" aria-hidden>
        🎉
      </p>
      <h2 className="mt-4 text-2xl font-bold text-white sm:text-3xl">{ui.completeTitle}</h2>
      <p className="mt-3 text-base text-slate-400">{ui.completeSubtitle}</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={onStartPractice}
          className="rounded-lg bg-sky-600 px-6 py-3 text-sm font-semibold text-white hover:bg-sky-500"
        >
          {ui.startPractice}
        </button>
        <button
          type="button"
          onClick={onReview}
          className="rounded-lg border border-slate-600 px-6 py-3 text-sm font-medium text-slate-300 hover:bg-slate-800"
        >
          {ui.reviewSection}
        </button>
      </div>
    </div>
  );
}
