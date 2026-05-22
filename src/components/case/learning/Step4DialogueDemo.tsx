"use client";

import { useState } from "react";
import { pickLocale } from "@/lib/case/learning/content-step1";
import { DIALOGUE_DEMOS, STEP4_INTRO } from "@/lib/case/learning/content-step4";
import { getLearningUi } from "@/lib/case/learning/i18n";
import type { CaseLocale } from "@/types/case-locale";

interface Step4DialogueDemoProps {
  locale: CaseLocale;
  onComplete: () => void;
  onSkipToNext: () => void;
}

export default function Step4DialogueDemo({
  locale,
  onComplete,
  onSkipToNext,
}: Step4DialogueDemoProps) {
  const ui = getLearningUi(locale);
  const [demoId, setDemoId] = useState(DIALOGUE_DEMOS[0].id);
  const [segmentIndex, setSegmentIndex] = useState(0);

  const demo = DIALOGUE_DEMOS.find((d) => d.id === demoId) ?? DIALOGUE_DEMOS[0];
  const visibleSegments = demo.segments.slice(0, segmentIndex + 1);
  const atEnd = segmentIndex >= demo.segments.length - 1;

  const handleDemoChange = (id: string) => {
    setDemoId(id);
    setSegmentIndex(0);
  };

  return (
    <div className="space-y-6">
      <p className="text-base leading-relaxed text-slate-300">
        {locale === "zh" ? STEP4_INTRO.zh : STEP4_INTRO.en}
      </p>

      <div className="flex flex-wrap gap-2">
        {DIALOGUE_DEMOS.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => handleDemoChange(d.id)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              demoId === d.id
                ? "bg-sky-600 text-white"
                : "border border-slate-700 text-slate-400 hover:text-white"
            }`}
          >
            {pickLocale(locale, d.label)}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="min-w-0 flex-1 space-y-4 rounded-xl border border-slate-700/80 bg-slate-900/50 p-4">
          {visibleSegments.map((seg) => (
            <div key={seg.id} className="space-y-3 border-b border-slate-800 pb-4 last:border-0">
              {seg.turns.map((turn, ti) => (
                <div key={ti}>
                  <div
                    className={`flex ${turn.speaker === "candidate" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        turn.speaker === "interviewer"
                          ? "bg-slate-800 text-slate-100"
                          : "bg-sky-600/30 text-white"
                      }`}
                    >
                      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        {turn.speaker === "interviewer" ? ui.interviewer : ui.candidate}
                      </p>
                      <p className="whitespace-pre-line">{pickLocale(locale, turn.text)}</p>
                    </div>
                  </div>
                  {turn.annotation && (
                    <aside
                      className={`mt-2 rounded-lg border px-3 py-2 text-xs lg:ml-4 ${
                        turn.annotation.tone === "good"
                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-100"
                          : "border-amber-500/40 bg-amber-500/10 text-amber-100"
                      }`}
                    >
                      {turn.annotation.tone === "good" ? "✓ " : "💡 "}
                      {pickLocale(locale, turn.annotation)}
                    </aside>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-3">
        <button
          type="button"
          onClick={onSkipToNext}
          className="rounded-lg border border-slate-600 px-5 py-2.5 text-sm text-slate-300 hover:bg-slate-800"
        >
          {locale === "zh" ? "跳过，完成本节 →" : "Skip and finish section →"}
        </button>
        {!atEnd && (
          <button
            type="button"
            onClick={() => setSegmentIndex((i) => i + 1)}
            className="rounded-lg border border-sky-500/50 bg-sky-500/10 px-5 py-2.5 text-sm font-medium text-sky-200 hover:bg-sky-500/20"
          >
            {ui.nextSegment}
          </button>
        )}
        {atEnd && (
          <button
            type="button"
            onClick={onComplete}
            className="rounded-lg bg-sky-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-sky-500"
          >
            {ui.next}
          </button>
        )}
      </div>
    </div>
  );
}
