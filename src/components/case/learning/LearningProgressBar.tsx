"use client";

import { getLearningUi } from "@/lib/case/learning/i18n";
import type { LearningStepId } from "@/lib/case/learning/types";
import { canAccessStep } from "@/lib/case/learning/types";
import type { LearningProgress } from "@/lib/case/learning/types";
import type { CaseLocale } from "@/types/case-locale";

const STEPS: LearningStepId[] = [1, 2, 3, 4];

interface LearningProgressBarProps {
  locale: CaseLocale;
  progress: LearningProgress;
  activeStep: LearningStepId;
  onStepClick: (step: LearningStepId) => void;
}

export default function LearningProgressBar({
  locale,
  progress,
  activeStep,
  onStepClick,
}: LearningProgressBarProps) {
  const ui = getLearningUi(locale);

  return (
    <div className="mb-8">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-widest text-slate-500">
          {ui.sectionTitle}
        </p>
        <p className="text-sm font-semibold text-sky-400">
          {ui.stepOf(activeStep, 4)}
        </p>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-sky-600 to-sky-400 transition-all duration-300"
          style={{ width: `${(activeStep / 4) * 100}%` }}
        />
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {STEPS.map((step) => {
          const unlocked = canAccessStep(step, progress);
          const active = step === activeStep;
          const done = progress.section1.completedSteps.includes(step);
          return (
            <button
              key={step}
              type="button"
              disabled={!unlocked}
              onClick={() => unlocked && onStepClick(step)}
              className={`rounded-lg px-2 py-2 text-center text-xs font-medium transition ${
                active
                  ? "bg-sky-600 text-white ring-2 ring-sky-400/50"
                  : done
                    ? "bg-sky-500/20 text-sky-200"
                    : unlocked
                      ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      : "cursor-not-allowed bg-slate-900 text-slate-600"
              }`}
            >
              {step}
            </button>
          );
        })}
      </div>
    </div>
  );
}
