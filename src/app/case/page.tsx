"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import CaseDiagnosis from "@/components/case/CaseDiagnosis";
import CaseLearnTab from "@/components/case/CaseLearnTab";
import CaseLocaleToggle from "@/components/case/CaseLocaleToggle";
import CasePageTabs, { type CasePageTab } from "@/components/case/CasePageTabs";
import CaseSelector from "@/components/case/CaseSelector";
import CaseChat from "@/components/case/CaseChat";
import { apiUrl } from "@/lib/api";
import type { CaseDiagnosisResult } from "@/lib/case/diagnosis";
import {
  diagnosisLevelHint,
  diagnosisLevelLabel,
  difficultyLabel,
  getCaseCopy,
  hintMessage,
} from "@/lib/case/i18n";
import {
  getLocalPreferences,
  getLocalPracticeHistory,
  isStorageUnavailableError,
} from "@/lib/case/local-preferences";
import {
  buildCaseRecommendation,
  type CaseRecommendation,
} from "@/lib/case/recommendations";
import { getCaseQuestions } from "@/lib/cases/catalog";
import type { CaseLocale } from "@/types/case-locale";
import { DEFAULT_CASE_LOCALE } from "@/types/case-locale";
import type { CaseDifficulty, CaseQuestion } from "@/types";

type DifficultyFilter = "all" | CaseDifficulty;

export default function CasePage() {
  const { user } = useUser();
  const [locale, setLocale] = useState<CaseLocale>(DEFAULT_CASE_LOCALE);
  const [pageTab, setPageTab] = useState<CasePageTab>("practice");
  const [cases, setCases] = useState<CaseQuestion[]>([]);
  const [loadingCases, setLoadingCases] = useState(true);
  const [casesError, setCasesError] = useState<string | null>(null);
  const [selectedCase, setSelectedCase] = useState<CaseQuestion | null>(null);
  const [sessionKey, setSessionKey] = useState(0);

  const [loadingPrefs, setLoadingPrefs] = useState(true);
  const [diagnosisCompleted, setDiagnosisCompleted] = useState(false);
  const [recommendation, setRecommendation] = useState<CaseRecommendation | null>(
    null
  );
  const [lastDiagnosis, setLastDiagnosis] = useState<CaseDiagnosisResult | null>(
    null
  );
  const [difficultyFilter, setDifficultyFilter] =
    useState<DifficultyFilter>("all");
  const [prefsError, setPrefsError] = useState<string | null>(null);

  const c = getCaseCopy(locale);

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

  const applyLocalRecommendations = useCallback(
    (activeLocale: CaseLocale, userId: string) => {
      const local = getLocalPreferences(userId);
      if (!local?.diagnosis_completed) return false;

      const catalogCases = getCaseQuestions(activeLocale);
      const history = getLocalPracticeHistory(userId);
      const rec = buildCaseRecommendation({
        cases: catalogCases,
        baseDifficulty: local.recommended_difficulty,
        history,
      });

      setDiagnosisCompleted(true);
      setLastDiagnosis(local.diagnosis_result);
      setRecommendation(rec);
      setDifficultyFilter(rec.difficulty);
      return true;
    },
    []
  );

  const loadRecommendations = useCallback(
    async (activeLocale: CaseLocale) => {
      setLoadingPrefs(true);
      setPrefsError(null);
      try {
        const res = await fetch(
          apiUrl(`/api/case/recommendations?locale=${activeLocale}`)
        );
        if (!res.ok) {
          const err = (await res.json().catch(() => ({}))) as {
            error?: string;
            code?: string;
          };
          if (
            user?.id &&
            (err.code === "MISSING_TABLE" ||
              isStorageUnavailableError(err.error)) &&
            applyLocalRecommendations(activeLocale, user.id)
          ) {
            setPrefsError(
              activeLocale === "zh"
                ? "诊断结果已暂存在本浏览器；请在 Supabase 运行 scripts/setup-case-practice.sql 以同步云端。"
                : "Diagnosis saved in this browser only. Run scripts/setup-case-practice.sql in Supabase to sync."
            );
            return;
          }
          throw new Error(err.error || "Failed to load recommendations");
        }
        const data = (await res.json()) as {
          diagnosisCompleted: boolean;
          recommendation: CaseRecommendation;
          preferences?: { diagnosis_result?: CaseDiagnosisResult | null };
        };
        setDiagnosisCompleted(data.diagnosisCompleted);
        setRecommendation(data.recommendation);
        if (data.preferences?.diagnosis_result) {
          setLastDiagnosis(data.preferences.diagnosis_result);
        }
        if (data.diagnosisCompleted && data.recommendation?.difficulty) {
          setDifficultyFilter(data.recommendation.difficulty);
        }
      } catch (e) {
        const message = e instanceof Error ? e.message : "Failed to load preferences";
        if (
          user?.id &&
          isStorageUnavailableError(message) &&
          applyLocalRecommendations(activeLocale, user.id)
        ) {
          setPrefsError(
            activeLocale === "zh"
              ? "诊断结果已暂存在本浏览器；请在 Supabase 运行 scripts/setup-case-practice.sql 以同步云端。"
              : "Diagnosis saved in this browser only. Run scripts/setup-case-practice.sql in Supabase to sync."
          );
        } else {
          setPrefsError(message);
        }
      } finally {
        setLoadingPrefs(false);
      }
    },
    [user?.id, applyLocalRecommendations]
  );

  useEffect(() => {
    loadCases(locale);
  }, [locale, loadCases]);

  useEffect(() => {
    loadRecommendations(locale);
  }, [locale, loadRecommendations]);

  const handleLocaleChange = (next: CaseLocale) => {
    setLocale(next);
    setSelectedCase(null);
    setSessionKey((k) => k + 1);
  };

  const handleDiagnosisComplete = (result: CaseDiagnosisResult) => {
    setLastDiagnosis(result);
    setDiagnosisCompleted(true);
    loadRecommendations(locale);
  };

  const showDiagnosis =
    pageTab === "practice" &&
    !loadingPrefs &&
    !diagnosisCompleted &&
    !selectedCase;

  const recommendationHint = recommendation
    ? hintMessage(locale, recommendation.hint)
    : null;

  const activeRecommendedDifficulty =
    recommendation?.difficulty ?? lastDiagnosis?.recommendedDifficulty ?? null;

  const diagnosisBanner =
    lastDiagnosis &&
    diagnosisCompleted &&
    !recommendationHint &&
    activeRecommendedDifficulty
      ? diagnosisLevelHint(locale, activeRecommendedDifficulty)
      : null;

  return (
    <div className="mx-auto min-w-0 max-w-6xl overflow-x-hidden px-4 py-8 sm:px-6">
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
              {locale === "zh" ? "返回题目列表" : "Back to cases"}
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-slate-500 transition hover:text-slate-300"
            >
              {locale === "zh" ? "首页" : "Home"}
            </Link>
          </>
        ) : (
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-1.5 text-sm text-slate-300 transition hover:border-slate-600 hover:text-white"
          >
            <span aria-hidden>←</span>
            {locale === "zh" ? "返回首页" : "Back to home"}
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

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">{c.pageTitle}</h1>
        <p className="mt-2 text-sm text-slate-400">{c.pageSubtitle}</p>
      </div>

      {!selectedCase && (
        <CasePageTabs
          locale={locale}
          active={pageTab}
          onChange={setPageTab}
        />
      )}

      {pageTab === "learn" && !selectedCase ? (
        <CaseLearnTab
          locale={locale}
          onStartPractice={() => {
            setPageTab("practice");
            setDifficultyFilter("easy");
          }}
        />
      ) : showDiagnosis ? (
        <CaseDiagnosis locale={locale} onComplete={handleDiagnosisComplete} />
      ) : (
        <>
          {!selectedCase && diagnosisCompleted && (
            <div className="mb-6 space-y-2 rounded-xl border border-slate-700/80 bg-slate-900/50 px-4 py-3">
              {lastDiagnosis && activeRecommendedDifficulty && (
                <p className="text-sm text-slate-300">
                  <span className="font-medium text-white">
                    {diagnosisLevelLabel(locale, lastDiagnosis.levelLabel)}
                  </span>
                  {" · "}
                  {c.recommendedDifficulty}:{" "}
                  <span className="font-medium text-sky-300">
                    {difficultyLabel(locale, activeRecommendedDifficulty)}
                  </span>
                </p>
              )}
              {recommendation && (
                <p className="text-sm text-slate-400">
                  {recommendationHint ?? diagnosisBanner}
                </p>
              )}
              {prefsError && (
                <p className="text-sm text-amber-400">{prefsError}</p>
              )}
            </div>
          )}

          {!selectedCase ? (
            <section>
              <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-slate-500">
                {c.selectCase}
              </h2>
              {loadingCases && (
                <p className="text-sm text-slate-500">{c.loadingCases}</p>
              )}
              {casesError && (
                <p className="mb-4 text-sm text-rose-400">{casesError}</p>
              )}
              {!loadingCases && cases.length > 0 && (
                <CaseSelector
                  cases={cases}
                  selected={selectedCase}
                  locale={locale}
                  recommendedCaseId={recommendation?.recommendedCaseId}
                  activeDifficulty={difficultyFilter}
                  onDifficultyChange={setDifficultyFilter}
                  onSelect={(item) => {
                    setSelectedCase(item);
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
                loadRecommendations(locale);
              }}
              onEvaluationSaved={() => loadRecommendations(locale)}
            />
          )}
        </>
      )}
    </div>
  );
}
