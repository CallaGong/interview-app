"use client";

import {
  CASE_TYPE_CARDS,
  pickLocale,
  STEP1_INTRO,
} from "@/lib/case/learning/content-step1";
import { getLearningUi } from "@/lib/case/learning/i18n";
import type { CaseLocale } from "@/types/case-locale";

interface Step1CaseTypesProps {
  locale: CaseLocale;
  onComplete: () => void;
  onSkipToNext: () => void;
}

export default function Step1CaseTypes({
  locale,
  onComplete,
  onSkipToNext,
}: Step1CaseTypesProps) {
  const ui = getLearningUi(locale);

  return (
    <div className="space-y-8">
      <p className="text-base leading-relaxed text-slate-300">
        {locale === "zh" ? STEP1_INTRO.zh : STEP1_INTRO.en}
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CASE_TYPE_CARDS.map((card) => (
          <article
            key={card.id}
            className="flex flex-col rounded-xl border border-slate-700/80 bg-slate-900/60 p-4"
          >
            <div className="mb-2 flex items-baseline gap-2">
              <span className="text-lg font-bold text-sky-400">{card.number}</span>
              <h3 className="text-sm font-semibold text-white">
                {card.titleEn}
                <span className="mt-0.5 block text-xs font-normal text-slate-400">
                  {card.titleZh}
                </span>
              </h3>
            </div>
            <p className="mb-3 text-sm text-slate-300">{pickLocale(locale, card.oneLiner)}</p>
            <p className="mb-2 text-xs text-slate-500">
              <span className="font-medium text-slate-400">
                {locale === "zh" ? "典型问法" : "Typical ask"}
              </span>
              <br />
              {pickLocale(locale, card.typicalAsk)}
            </p>
            <p className="mt-auto text-xs text-emerald-400/90">
              <span className="font-medium">
                {locale === "zh" ? "考察重点" : "Focus"}
              </span>
              ：{pickLocale(locale, card.focus)}
            </p>
          </article>
        ))}
      </div>

      <div className="flex flex-wrap justify-end gap-3">
        <button
          type="button"
          onClick={onSkipToNext}
          className="rounded-lg border border-slate-600 px-5 py-2.5 text-sm text-slate-300 hover:bg-slate-800"
        >
          {ui.skipToNext}
        </button>
        <button
          type="button"
          onClick={onComplete}
          className="rounded-lg bg-sky-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-sky-500"
        >
          {ui.next}
        </button>
      </div>
    </div>
  );
}
