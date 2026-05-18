"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import CaseLocaleToggle from "@/components/case/CaseLocaleToggle";
import CaseSelector from "@/components/case/CaseSelector";
import CaseChat from "@/components/case/CaseChat";
import { apiUrl } from "@/lib/api";
import type { CaseLocale } from "@/types/case-locale";
import { DEFAULT_CASE_LOCALE } from "@/types/case-locale";
import type { CaseQuestion } from "@/types";

export default function CasePage() {
  const [locale, setLocale] = useState<CaseLocale>(DEFAULT_CASE_LOCALE);
  const [cases, setCases] = useState<CaseQuestion[]>([]);
  const [loadingCases, setLoadingCases] = useState(true);
  const [casesError, setCasesError] = useState<string | null>(null);
  const [selectedCase, setSelectedCase] = useState<CaseQuestion | null>(null);
  const [sessionKey, setSessionKey] = useState(0);

  const loadCases = useCallback(async (activeLocale: CaseLocale) => {
    setLoadingCases(true);
    setCasesError(null);
    try {
      const res = await fetch(apiUrl(`/api/cases?locale=${activeLocale}`));
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to load cases");
      }
      const data = (await res.json()) as { cases: CaseQuestion[] };
      setCases(data.cases ?? []);
    } catch (e) {
      setCasesError(e instanceof Error ? e.message : "Failed to load cases");
    } finally {
      setLoadingCases(false);
    }
  }, []);

  useEffect(() => {
    loadCases(locale);
  }, [locale, loadCases]);

  const handleLocaleChange = (next: CaseLocale) => {
    setLocale(next);
    setSelectedCase(null);
    setSessionKey((k) => k + 1);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        {selectedCase ? (
          <>
            <button
              type="button"
              onClick={() => {
                setSelectedCase(null);
                setSessionKey((k) => k + 1);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-1.5 text-sm text-slate-300 transition hover:border-slate-600 hover:text-white"
            >
              <span aria-hidden>←</span>
              Back to cases
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-slate-500 transition hover:text-slate-300"
            >
              Home
            </Link>
          </>
        ) : (
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-1.5 text-sm text-slate-300 transition hover:border-slate-600 hover:text-white"
          >
            <span aria-hidden>←</span>
            Back to home
          </Link>
        )}
        <div className="ml-auto">
          <CaseLocaleToggle
            locale={locale}
            onChange={handleLocaleChange}
            disabled={loadingCases}
          />
        </div>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Case practice</h1>
        <p className="mt-2 text-sm text-slate-400">
          Pick a case and practice with an AI interviewer. Type{" "}
          <code className="text-sky-400">end evaluation</code> or{" "}
          <code className="text-sky-400">结束评估</code> when you are ready for feedback.
        </p>
      </div>

      {!selectedCase ? (
        <section>
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-slate-500">
            Select a case
          </h2>
          {loadingCases && (
            <p className="text-sm text-slate-500">Loading cases…</p>
          )}
          {casesError && (
            <p className="mb-4 text-sm text-rose-400">{casesError}</p>
          )}
          {!loadingCases && cases.length > 0 && (
            <CaseSelector
              cases={cases}
              selected={selectedCase}
              locale={locale}
              onSelect={(c) => {
                setSelectedCase(c);
                setSessionKey((k) => k + 1);
              }}
            />
          )}
        </section>
      ) : (
        <CaseChat
          key={`${selectedCase.id}-${locale}-${sessionKey}`}
          caseQuestion={selectedCase}
          locale={locale}
          onReset={() => {
            setSelectedCase(null);
            setSessionKey((k) => k + 1);
          }}
        />
      )}
    </div>
  );
}
