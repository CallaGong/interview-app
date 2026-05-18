"use client";

import { useState } from "react";
import {
  pickInterviewDimensions,
  type BehavioralDimension,
} from "@/lib/interview/dimensions";
import type { InterviewLocale } from "@/types/interview";
import InterviewChat from "./InterviewChat";
import InterviewPrep from "./InterviewPrep";

interface InterviewPanelProps {
  locale: InterviewLocale;
}

export default function InterviewPanel({ locale }: InterviewPanelProps) {
  const [phase, setPhase] = useState<"prep" | "interview">("prep");
  const [resumeText, setResumeText] = useState<string | null>(null);
  const [focusDimensions, setFocusDimensions] = useState<BehavioralDimension[]>(
    () => pickInterviewDimensions(locale)
  );
  const [sessionKey, setSessionKey] = useState(0);

  const handleStart = (text: string | null) => {
    setResumeText(text);
    setFocusDimensions(pickInterviewDimensions(locale));
    setPhase("interview");
    setSessionKey((k) => k + 1);
  };

  const handleBack = () => {
    setPhase("prep");
    setResumeText(null);
    setSessionKey((k) => k + 1);
  };

  if (phase === "prep") {
    return <InterviewPrep locale={locale} onStart={handleStart} />;
  }

  return (
    <InterviewChat
      key={sessionKey}
      locale={locale}
      resumeText={resumeText}
      focusDimensions={focusDimensions}
      onBack={handleBack}
    />
  );
}
