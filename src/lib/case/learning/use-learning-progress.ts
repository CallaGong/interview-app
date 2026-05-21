"use client";

import { useCallback, useEffect, useState } from "react";
import { apiUrl } from "@/lib/api";
import { isStorageUnavailableError } from "@/lib/case/local-preferences";
import {
  DEFAULT_LEARNING_PROGRESS,
  normalizeLearningProgress,
  type LearningProgress,
  type LearningStepId,
} from "@/lib/case/learning/types";

const LOCAL_LEARNING_KEY = "caseready_learning_progress_v1";

function getLocalProgress(userId: string): LearningProgress | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LOCAL_LEARNING_KEY);
    if (!raw) return null;
    const store = JSON.parse(raw) as Record<string, LearningProgress>;
    return store[userId] ? normalizeLearningProgress(store[userId]) : null;
  } catch {
    return null;
  }
}

function setLocalProgress(userId: string, progress: LearningProgress): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(LOCAL_LEARNING_KEY);
    const store = raw ? (JSON.parse(raw) as Record<string, LearningProgress>) : {};
    store[userId] = progress;
    localStorage.setItem(LOCAL_LEARNING_KEY, JSON.stringify(store));
  } catch {
    /* ignore */
  }
}

export function useLearningProgress(userId: string | undefined) {
  const [progress, setProgress] = useState<LearningProgress>(DEFAULT_LEARNING_PROGRESS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(apiUrl("/api/case/learning-progress"));
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        if (isStorageUnavailableError(err.error)) {
          const local = getLocalProgress(userId);
          setProgress(local ?? DEFAULT_LEARNING_PROGRESS);
          return;
        }
        throw new Error(err.error || "Failed to load learning progress");
      }
      const data = (await res.json()) as { learningProgress: LearningProgress };
      setProgress(normalizeLearningProgress(data.learningProgress));
    } catch (e) {
      const local = getLocalProgress(userId);
      setProgress(local ?? DEFAULT_LEARNING_PROGRESS);
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const persist = useCallback(
    async (next: LearningProgress) => {
      setProgress(next);
      if (!userId) return;

      setLocalProgress(userId, next);
      setSaving(true);
      try {
        const res = await fetch(apiUrl("/api/case/learning-progress"), {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ learningProgress: next }),
        });
        if (!res.ok) {
          const err = (await res.json().catch(() => ({}))) as { error?: string };
          if (!isStorageUnavailableError(err.error)) {
            throw new Error(err.error || "Failed to save");
          }
        }
      } catch (e) {
        if (!isStorageUnavailableError(e instanceof Error ? e.message : undefined)) {
          setError(e instanceof Error ? e.message : "Failed to save");
        }
      } finally {
        setSaving(false);
      }
    },
    [userId]
  );

  const setCurrentStep = useCallback(
    (step: LearningStepId) => {
      const next: LearningProgress = {
        section1: { ...progress.section1, currentStep: step },
      };
      void persist(next);
    },
    [progress.section1, persist]
  );

  return {
    progress,
    loading,
    saving,
    error,
    persist,
    setCurrentStep,
    reload: load,
  };
}
