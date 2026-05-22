"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { getLearningUi } from "@/lib/case/learning/i18n";
import {
  canAccessStep,
  markStepComplete,
  resetSection1Progress,
  type LearningProgress,
  type LearningStepId,
} from "@/lib/case/learning/types";
import { useLearningProgress } from "@/lib/case/learning/use-learning-progress";
import LearningComplete from "@/components/case/learning/LearningComplete";
import LearningProgressBar from "@/components/case/learning/LearningProgressBar";
import Step1CaseTypes from "@/components/case/learning/Step1CaseTypes";
import Step2IdentifyType from "@/components/case/learning/Step2IdentifyType";
import Step3InteractiveDrill from "@/components/case/learning/Step3InteractiveDrill";
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

  const goToNextStep = () => {
    if (activeStep >= 4) return;
    const next = (activeStep + 1) as LearningStepId;
    setActiveStep(next);
    setCurrentStep(next);
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
        onReview={async () => {
          const reset = resetSection1Progress();
          await persist(reset);
          setActiveStep(1);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    );
  }

  return (
    <div className="mx-auto min-w-0 max-w-6xl">
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

      {activeStep === 1 ? (
        <Step1CaseTypes
          locale={locale}
          onComplete={() => void completeStep(1)}
          onSkipToNext={goToNextStep}
        />
      ) : activeStep === 2 ? (
        <Step2IdentifyType
          locale={locale}
          onComplete={(correctCount) =>
            void completeStep(2, { step2CorrectCount: correctCount })
          }
          onSkipToNext={goToNextStep}
        />
      ) : activeStep === 3 ? (
        <Step3InteractiveDrill
          locale={locale}
          onComplete={() => void completeStep(3)}
          onSkipToNext={goToNextStep}
        />
      ) : (
        <Step4DialogueDemo
          locale={locale}
          onComplete={() => void completeStep(4)}
          onSkipToNext={() => void completeStep(4)}
        />
      )}
    </div>
  );
}
