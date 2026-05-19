import type { CaseDiagnosisResult } from "@/lib/case/diagnosis";
import type { PracticeHistoryRow } from "@/lib/case/recommendations";
import type { CaseDifficulty, CaseEvaluationScores } from "@/types";

const PREFS_STORAGE_KEY = "caseready_user_preferences_v1";
const HISTORY_STORAGE_KEY = "caseready_practice_history_v1";

export interface LocalUserPreferences {
  diagnosis_completed: boolean;
  recommended_difficulty: CaseDifficulty;
  diagnosis_result: CaseDiagnosisResult | null;
}

export interface LocalPracticeHistoryRow extends PracticeHistoryRow {
  scores?: CaseEvaluationScores;
}

function readJson<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

type PrefsStore = Record<string, LocalUserPreferences>;
type HistoryStore = Record<string, LocalPracticeHistoryRow[]>;

export function getLocalPreferences(userId: string): LocalUserPreferences | null {
  const store = readJson<PrefsStore>(PREFS_STORAGE_KEY);
  return store?.[userId] ?? null;
}

export function setLocalPreferences(
  userId: string,
  prefs: LocalUserPreferences
): void {
  const store = readJson<PrefsStore>(PREFS_STORAGE_KEY) ?? {};
  store[userId] = prefs;
  writeJson(PREFS_STORAGE_KEY, store);
}

export function getLocalPracticeHistory(userId: string): LocalPracticeHistoryRow[] {
  const store = readJson<HistoryStore>(HISTORY_STORAGE_KEY);
  return store?.[userId] ?? [];
}

export function appendLocalPracticeHistory(
  userId: string,
  row: LocalPracticeHistoryRow
): void {
  const store = readJson<HistoryStore>(HISTORY_STORAGE_KEY) ?? {};
  const list = store[userId] ?? [];
  store[userId] = [row, ...list].slice(0, 50);
  writeJson(HISTORY_STORAGE_KEY, store);
}

export function isStorageUnavailableError(message: string | undefined): boolean {
  if (!message) return false;
  const lower = message.toLowerCase();
  return (
    lower.includes("user_preferences") ||
    lower.includes("user_practice_history") ||
    lower.includes("pgrst205") ||
    lower.includes("could not find the table") ||
    lower.includes("missing_table") ||
    lower.includes("not set up")
  );
}
