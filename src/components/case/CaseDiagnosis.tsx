"use client";

import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { apiUrl } from "@/lib/api";
import type {
  CaseDiagnosisAnswers,
  CaseDiagnosisResult,
  CaseExperience,
  CaseFrameworkKnowledge,
  MockInterviewExperience,
} from "@/lib/case/diagnosis";
import { diagnoseFromAnswers } from "@/lib/case/diagnosis";
import { getCaseCopy } from "@/lib/case/i18n";
import {
  isStorageUnavailableError,
  setLocalPreferences,
} from "@/lib/case/local-preferences";
import type { CaseLocale } from "@/types/case-locale";

interface CaseDiagnosisProps {
  locale: CaseLocale;
  onComplete: (result: CaseDiagnosisResult) => void;
}

export default function CaseDiagnosis({ locale, onComplete }: CaseDiagnosisProps) {
  const { user } = useUser();
  const c = getCaseCopy(locale);
  const [experience, setExperience] = useState<CaseExperience | null>(null);
  const [frameworks, setFrameworks] = useState<CaseFrameworkKnowledge[]>([]);
  const [mockInterview, setMockInterview] =
    useState<MockInterviewExperience | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleFramework = (key: CaseFrameworkKnowledge) => {
    setFrameworks((prev) => {
      if (key === "none") {
        return prev.includes("none") ? [] : ["none"];
      }
      const withoutNone = prev.filter((f) => f !== "none");
      if (withoutNone.includes(key)) {
        return withoutNone.filter((f) => f !== key);
      }
      return [...withoutNone, key];
    });
  };

  const canSubmit =
    experience !== null && mockInterview !== null && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit || experience === null || mockInterview === null) return;

    const answers: CaseDiagnosisAnswers = {
      experience,
      frameworks: frameworks.length > 0 ? frameworks : ["none"],
      mockInterview,
    };

    const result = diagnoseFromAnswers(answers);

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(apiUrl("/api/case/preferences"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as {
          error?: string;
          code?: string;
        };
        if (
          user?.id &&
          (err.code === "MISSING_TABLE" ||
            isStorageUnavailableError(err.error))
        ) {
          setLocalPreferences(user.id, {
            diagnosis_completed: true,
            recommended_difficulty: result.recommendedDifficulty,
            diagnosis_result: result,
          });
          onComplete(result);
          return;
        }
        throw new Error(err.error || "Failed to save diagnosis");
      }
      const data = (await res.json()) as { result: CaseDiagnosisResult };
      onComplete(data.result ?? result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const experienceOptions: { value: CaseExperience; label: string }[] = [
    { value: "none", label: c.experienceNone },
    { value: "few", label: c.experienceFew },
    { value: "often", label: c.experienceOften },
  ];

  const frameworkOptions: {
    value: CaseFrameworkKnowledge;
    label: string;
  }[] = [
    { value: "profit_tree", label: c.frameworkProfit },
    { value: "market_entry", label: c.frameworkMarket },
    { value: "mergers", label: c.frameworkMa },
    { value: "none", label: c.frameworkNone },
  ];

  const mockOptions: { value: MockInterviewExperience; label: string }[] = [
    { value: "never", label: c.mockNever },
    { value: "yes", label: c.mockYes },
  ];

  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-slate-700/80 bg-slate-900/60 p-6 sm:p-8">
      <h2 className="text-xl font-semibold text-white">{c.diagnosisTitle}</h2>
      <p className="mt-2 text-sm text-slate-400">{c.diagnosisSubtitle}</p>

      <div className="mt-8 space-y-8">
        <fieldset>
          <legend className="mb-3 text-sm font-medium text-slate-200">
            {c.qExperience}
          </legend>
          <div className="flex flex-col gap-2">
            {experienceOptions.map((opt) => (
              <label
                key={opt.value}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm transition ${
                  experience === opt.value
                    ? "border-sky-500/60 bg-sky-500/10 text-white"
                    : "border-slate-700 text-slate-300 hover:border-slate-600"
                }`}
              >
                <input
                  type="radio"
                  name="experience"
                  className="accent-sky-500"
                  checked={experience === opt.value}
                  onChange={() => setExperience(opt.value)}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-3 text-sm font-medium text-slate-200">
            {c.qFrameworks}
          </legend>
          <div className="flex flex-col gap-2">
            {frameworkOptions.map((opt) => (
              <label
                key={opt.value}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm transition ${
                  frameworks.includes(opt.value)
                    ? "border-sky-500/60 bg-sky-500/10 text-white"
                    : "border-slate-700 text-slate-300 hover:border-slate-600"
                }`}
              >
                <input
                  type="checkbox"
                  className="accent-sky-500"
                  checked={frameworks.includes(opt.value)}
                  onChange={() => toggleFramework(opt.value)}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-3 text-sm font-medium text-slate-200">
            {c.qMock}
          </legend>
          <div className="flex flex-col gap-2">
            {mockOptions.map((opt) => (
              <label
                key={opt.value}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm transition ${
                  mockInterview === opt.value
                    ? "border-sky-500/60 bg-sky-500/10 text-white"
                    : "border-slate-700 text-slate-300 hover:border-slate-600"
                }`}
              >
                <input
                  type="radio"
                  name="mock"
                  className="accent-sky-500"
                  checked={mockInterview === opt.value}
                  onChange={() => setMockInterview(opt.value)}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      {error && <p className="mt-4 text-sm text-rose-400">{error}</p>}

      <button
        type="button"
        disabled={!canSubmit}
        onClick={handleSubmit}
        className="mt-8 w-full rounded-lg bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? "…" : c.submitDiagnosis}
      </button>
    </div>
  );
}
