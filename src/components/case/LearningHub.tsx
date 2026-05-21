"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { getLearningUi } from "@/lib/case/learning/i18n";
import {
  canAccessStep,
  markStepComplete,
  type LearningProgress,
  type LearningStepId,
} from "@/lib/case/learning/types";
import { useLearningProgress } from "@/lib/case/learning/use-learning-progress";
import LearningComplete from "@/components/case/learning/LearningComplete";
import LearningProgressBar from "@/components/case/learning/LearningProgressBar";
import Step1CaseTypes from "@/components/case/learning/Step1CaseTypes";
import Step2IdentifyType from "@/components/case/learning/Step2IdentifyType";
import Step3Frameworks from "@/components/case/learning/Step3Frameworks";
import Step4DialogueDemo from "@/components/case/learning/Step4DialogueDemo";
import type { CaseLocale } from "@/types/case-locale";

interface LearningHubProps {
  locale: CaseLocale;
  onStartPractice: () => void;
}

export default function LearningHub({ locale, onStartPractice }: LearningHubProps) {
  const { user } = useUser();
  const { progress, loading, saving, error, persist, setCurrentStep } =
    useLearningProgress(user?.id);

  const [activeStep, setActiveStep] = useState<LearningStepId>(1);
  const ui = getLearningUi(locale);

  useEffect(() => {
    if (!loading) {
      setActiveStep(progress.section1.currentStep);
    }
  }, [loading, progress.section1.currentStep]);

  const handleStepClick = (step: LearningStepId) => {
    if (!canAccessStep(step, progress)) return;
    setActiveStep(step);
    setCurrentStep(step);
  };

  const completeStep = async (step: LearningStepId, patch?: Partial<LearningProgress["section1"]>) => {
    let next = markStepComplete(progress, step);
    if (patch) {
      next = { section1: { ...next.section1, ...patch } };
    }
    await persist(next);
    const unlocked = next.section1.currentStep;
    setActiveStep(unlocked);
  };

  if (loading) {
    return (
      <p className="py-12 text-center text-sm text-slate-500">
        {locale === "zh" ? "加载学习内容…" : "Loading learning content…"}
      </p>
    );
  }

  if (progress.section1.sectionCompleted) {
    return (
      <LearningComplete
        locale={locale}
        onStartPractice={onStartPractice}
        onReview={() => {
          const review: LearningProgress = {
            section1: {
              currentStep: 1,
              completedSteps: progress.section1.completedSteps,
              sectionCompleted: true,
            },
          };
          void persist(review);
          setActiveStep(1);
        }}
      />
    );
  }

  return (
    <div className="mx-auto min-w-0 max-w-5xl">
      {error && (
        <p className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-sm text-amber-200">
          {ui.loadError}
        </p>
      )}
      {saving && (
        <p className="mb-2 text-right text-xs text-slate-500">{ui.saving}</p>
      )}

      <LearningProgressBar
        locale={locale}
        progress={progress}
        activeStep={activeStep}
        onStepClick={handleStepClick}
      />

      {!canAccessStep(activeStep, progress) ? (
        <p className="rounded-xl border border-slate-700 bg-slate-900/60 p-6 text-center text-sm text-slate-400">
          {ui.locked}
        </p>
      ) : activeStep === 1 ? (
        <Step1CaseTypes
          locale={locale}
          onComplete={() => void completeStep(1)}
        />
      ) : activeStep === 2 ? (
        <Step2IdentifyType
          locale={locale}
          onComplete={(correctCount) =>
            void completeStep(2, { step2CorrectCount: correctCount })
          }
        />
      ) : activeStep === 3 ? (
        <Step3Frameworks
          locale={locale}
          onComplete={() => void completeStep(3)}
        />
      ) : (
        <Step4DialogueDemo
          locale={locale}
          onComplete={() => void completeStep(4)}
        />
      )}
    </div>
  );
}
