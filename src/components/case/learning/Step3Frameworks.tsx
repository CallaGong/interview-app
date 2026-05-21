"use client";

import { useState } from "react";
import { pickLocale } from "@/lib/case/learning/content-step1";
import {
  STEP3_INTRO,
  TYPE_TEMPLATES,
  UNIVERSAL_FOUR_STEPS,
} from "@/lib/case/learning/content-step3";
import { getLearningUi } from "@/lib/case/learning/i18n";
import type { CaseLocale } from "@/types/case-locale";

interface Step3FrameworksProps {
  locale: CaseLocale;
  onComplete: () => void;
}

export default function Step3Frameworks({ locale, onComplete }: Step3FrameworksProps) {
  const ui = getLearningUi(locale);
  const [activeTab, setActiveTab] = useState(TYPE_TEMPLATES[0].id);
  const template = TYPE_TEMPLATES.find((t) => t.id === activeTab) ?? TYPE_TEMPLATES[0];

  return (
    <div className="space-y-8">
      <p className="text-base leading-relaxed text-slate-300">
        {locale === "zh" ? STEP3_INTRO.zh : STEP3_INTRO.en}
      </p>

      <section className="rounded-xl border border-slate-700/80 bg-slate-900/50 p-4 sm:p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
          {locale === "zh" ? "通用解题四步法" : "Universal 4-step flow"}
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {UNIVERSAL_FOUR_STEPS.map((phase) => (
            <div
              key={pickLocale(locale, phase.title)}
              className="rounded-lg border border-slate-700/60 bg-slate-950/50 p-4"
            >
              <h4 className="mb-1 text-sm font-semibold text-white">
                {pickLocale(locale, phase.title)}
              </h4>
              <p className="mb-3 text-xs text-slate-500">{pickLocale(locale, phase.summary)}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="mb-1 text-[10px] font-semibold uppercase text-emerald-400">
                    ✓ {ui.doLabel}
                  </p>
                  <ul className="space-y-1 text-xs text-slate-400">
                    {phase.dos.map((d, i) => (
                      <li key={i}>{pickLocale(locale, d)}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="mb-1 text-[10px] font-semibold uppercase text-rose-400">
                    ✗ {ui.dontLabel}
                  </p>
                  <ul className="space-y-1 text-xs text-slate-400">
                    {phase.donts.map((d, i) => (
                      <li key={i}>{pickLocale(locale, d)}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex flex-wrap gap-2">
          {TYPE_TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                activeTab === t.id
                  ? "bg-sky-600 text-white"
                  : "border border-slate-700 text-slate-400 hover:text-white"
              }`}
            >
              {pickLocale(locale, t.tabLabel)}
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-slate-700/80 bg-slate-900/60 p-4 sm:p-6">
          <h4 className="mb-3 text-sm font-semibold text-white">
            {locale === "zh" ? "标准步骤" : "Standard steps"}
          </h4>
          <ol className="mb-6 list-decimal space-y-2 pl-5 text-sm text-slate-300">
            {template.steps.map((s, i) => (
              <li key={i}>{pickLocale(locale, s)}</li>
            ))}
          </ol>

          <p className="mb-2 text-xs font-medium text-slate-500">
            {locale === "zh" ? "经典框架" : "Framework"}
          </p>
          <p className="mb-4 text-sm text-slate-300">{pickLocale(locale, template.framework)}</p>

          <p className="mb-2 text-xs font-medium text-slate-500">
            {locale === "zh" ? "例题示范" : "Example"}
          </p>
          <p className="mb-4 whitespace-pre-line text-sm text-slate-300">
            {pickLocale(locale, template.example)}
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-medium text-emerald-400">
                {locale === "zh" ? "关键加分点" : "Strengths"}
              </p>
              <ul className="space-y-1 text-sm text-slate-400">
                {template.strengths.map((s, i) => (
                  <li key={i}>✓ {pickLocale(locale, s)}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium text-rose-400">
                {locale === "zh" ? "常见陷阱" : "Traps"}
              </p>
              <ul className="space-y-1 text-sm text-slate-400">
                {template.traps.map((s, i) => (
                  <li key={i}>✗ {pickLocale(locale, s)}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <div className="flex justify-end">
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
