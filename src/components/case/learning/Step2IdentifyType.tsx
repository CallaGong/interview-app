"use client";

import { useState } from "react";
import {
  STEP2_INTRO,
  STEP2_PASS_THRESHOLD,
  STEP2_QUIZ,
  STEP2_TECHNIQUES,
  type QuizCaseType,
} from "@/lib/case/learning/content-step2";
import { pickLocale } from "@/lib/case/learning/content-step1";
import { getLearningUi } from "@/lib/case/learning/i18n";
import type { CaseLocale } from "@/types/case-locale";

interface Step2IdentifyTypeProps {
  locale: CaseLocale;
  onComplete: (correctCount: number) => void;
  onSkipToNext: () => void;
}

export default function Step2IdentifyType({
  locale,
  onComplete,
  onSkipToNext,
}: Step2IdentifyTypeProps) {
  const ui = getLearningUi(locale);
  const [answers, setAnswers] = useState<Record<string, QuizCaseType | null>>({});
  const [submitted, setSubmitted] = useState(false);

  const correctCount = STEP2_QUIZ.filter((q) => answers[q.id] === q.correct).length;
  const passed = submitted && correctCount >= STEP2_PASS_THRESHOLD;

  const handleSubmit = () => {
    if (Object.keys(answers).length < STEP2_QUIZ.length) return;
    setSubmitted(true);
  };

  return (
    <div className="space-y-8">
      <p className="text-base leading-relaxed text-slate-300">
        {locale === "zh" ? STEP2_INTRO.zh : STEP2_INTRO.en}
      </p>

      {STEP2_TECHNIQUES.map((tech) => (
        <section
          key={pickLocale(locale, tech.title)}
          className="rounded-xl border border-slate-700/80 bg-slate-900/50 p-4 sm:p-5"
        >
          <h3 className="mb-3 text-sm font-semibold text-white">
            {pickLocale(locale, tech.title)}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[280px] text-left text-sm">
              <tbody>
                {tech.rows.map((row, i) => (
                  <tr key={i} className="border-t border-slate-800 first:border-0">
                    <td className="py-2 pr-4 text-slate-400">
                      {pickLocale(locale, row.keywords)}
                    </td>
                    <td className="py-2 font-medium text-sky-300">
                      → {pickLocale(locale, row.type)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {locale === "zh" ? "互动练习" : "Practice quiz"}
        </h3>
        {STEP2_QUIZ.map((q, idx) => {
          const chosen = answers[q.id];
          const showResult = submitted && chosen != null;
          const isCorrect = chosen === q.correct;

          return (
            <div
              key={q.id}
              className="rounded-xl border border-slate-700/80 bg-slate-900/60 p-4"
            >
              <p className="mb-3 text-sm font-medium text-white">
                {idx + 1}. {pickLocale(locale, q.prompt)}
              </p>
              <div className="flex flex-wrap gap-2">
                {q.options.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={submitted && passed}
                    onClick={() =>
                      setAnswers((prev) => ({ ...prev, [q.id]: opt.id }))
                    }
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                      chosen === opt.id
                        ? showResult
                          ? isCorrect
                            ? "border-emerald-500/60 bg-emerald-500/20 text-emerald-200"
                            : "border-rose-500/60 bg-rose-500/20 text-rose-200"
                          : "border-sky-500/60 bg-sky-500/20 text-white"
                        : "border-slate-700 text-slate-400 hover:border-slate-600"
                    }`}
                  >
                    {pickLocale(locale, opt.label)}
                  </button>
                ))}
              </div>
              {showResult && (
                <p
                  className={`mt-3 text-sm ${isCorrect ? "text-emerald-400" : "text-amber-400"}`}
                >
                  {isCorrect ? ui.correct : ui.incorrect} —{" "}
                  {pickLocale(locale, q.explanation)}
                </p>
              )}
            </div>
          );
        })}
      </section>

      {submitted && (
        <p className="text-center text-sm font-medium text-slate-300">
          {ui.step2Score(correctCount, STEP2_QUIZ.length)}
          {!passed && (
            <span className="mt-1 block text-amber-400">{ui.step2NeedScore}</span>
          )}
        </p>
      )}

      <div className="flex flex-wrap justify-end gap-3">
        <button
          type="button"
          onClick={onSkipToNext}
          className="rounded-lg border border-slate-600 px-5 py-2.5 text-sm text-slate-300 hover:bg-slate-800"
        >
          {ui.skipToNext}
        </button>
        {submitted && !passed && (
          <button
            type="button"
            onClick={() => {
              setAnswers({});
              setSubmitted(false);
            }}
            className="rounded-lg border border-slate-600 px-5 py-2.5 text-sm text-slate-300 hover:bg-slate-800"
          >
            {ui.tryAgain}
          </button>
        )}
        <button
          type="button"
          disabled={!submitted && Object.keys(answers).length < STEP2_QUIZ.length}
          onClick={() => {
            if (!submitted) {
              handleSubmit();
            } else {
              onComplete(correctCount);
            }
          }}
          className="rounded-lg bg-sky-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {!submitted
            ? locale === "zh"
              ? "提交答案"
              : "Submit answers"
            : ui.next}
        </button>
      </div>
    </div>
  );
}
