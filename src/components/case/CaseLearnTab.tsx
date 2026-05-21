"use client";

import LearningHub from "@/components/case/LearningHub";
import type { CaseLocale } from "@/types/case-locale";

interface CaseLearnTabProps {
  locale: CaseLocale;
  onStartPractice: () => void;
}

export default function CaseLearnTab({ locale, onStartPractice }: CaseLearnTabProps) {
  return <LearningHub locale={locale} onStartPractice={onStartPractice} />;
}
