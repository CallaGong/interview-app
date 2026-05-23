"use client";

import type { LiveTimeLimitMinutes } from "@/components/case/live/LiveModeChat";
import type { CaseLocale } from "@/types/case-locale";
import type { CaseQuestion } from "@/types";

export interface LiveModeSetupModalProps {
  caseQuestion: CaseQuestion;
  locale: CaseLocale;
  minutes: LiveTimeLimitMinutes;
  onMinutesChange: (m: LiveTimeLimitMinutes) => void;
  onCancel: () => void;
  onStart: () => void;
}

export default function LiveModeSetupModal({
  caseQuestion,
  locale,
  minutes,
  onMinutesChange,
  onCancel,
  onStart,
}: LiveModeSetupModalProps) {
  const copy =
    locale === "zh"
      ? {
          title: "Live 实战面试",
          case: "题目",
          duration: "面试时长",
          hint: "Live Mode 会模拟真实面试：随时打断、不等你写完、严格计时。",
          headphones: "建议戴耳机，找安静环境。",
          cancel: "取消",
          start: "开始面试",
        }
      : {
          title: "Live Interview",
          case: "Case",
          duration: "Duration",
          hint: "Live Mode simulates a real interview: interruptions, no waiting for you to finish, strict timing.",
          headphones: "We recommend headphones and a quiet space.",
          cancel: "Cancel",
          start: "Start Interview",
        };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="live-setup-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-600 bg-slate-900 p-6 shadow-2xl">
        <h2 id="live-setup-title" className="mb-1 text-lg font-semibold text-white">
          {copy.title}
        </h2>
        <p className="mb-4 text-sm text-slate-400">
          {copy.case}: {caseQuestion.title}
        </p>

        <p className="mb-2 text-xs font-medium uppercase text-slate-500">
          {copy.duration}
        </p>
        <div className="mb-4 flex gap-2">
          {([15, 30, 45] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => onMinutesChange(m)}
              className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition ${
                minutes === m
                  ? "bg-rose-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {m} min
            </button>
          ))}
        </div>

        <p className="mb-2 text-sm text-amber-200/90">{copy.hint}</p>
        <p className="mb-6 text-sm text-slate-400">{copy.headphones}</p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-lg border border-slate-600 py-2.5 text-sm text-slate-300 hover:bg-slate-800"
          >
            {copy.cancel}
          </button>
          <button
            type="button"
            onClick={onStart}
            className="flex-1 rounded-lg bg-rose-600 py-2.5 text-sm font-medium text-white hover:bg-rose-500"
          >
            {copy.start}
          </button>
        </div>
      </div>
    </div>
  );
}
