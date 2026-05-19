import type { CaseDiagnosisResult } from "@/lib/case/diagnosis";
import type { CaseDifficulty, CaseEvaluationScores } from "@/types";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export interface UserPreferencesRow {
  user_id: string;
  recommended_difficulty: CaseDifficulty | null;
  diagnosis_completed: boolean;
  diagnosis_result: CaseDiagnosisResult | null;
  updated_at: string;
}

export interface PracticeHistoryInsert {
  userId: string;
  caseId: string;
  difficulty: CaseDifficulty;
  scores: CaseEvaluationScores;
  overallScore: number;
}

export interface PracticeHistoryRow {
  id: string;
  user_id: string;
  case_id: string;
  difficulty: CaseDifficulty;
  scores: CaseEvaluationScores | null;
  overall_score: number | null;
  completed_at: string;
}

export async function getUserPreferences(
  userId: string
): Promise<UserPreferencesRow | null> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data as UserPreferencesRow | null;
}

export async function saveDiagnosisResult(
  userId: string,
  result: CaseDiagnosisResult
): Promise<void> {
  const supabase = createSupabaseAdmin();
  const { error } = await supabase.from("user_preferences").upsert(
    {
      user_id: userId,
      recommended_difficulty: result.recommendedDifficulty,
      diagnosis_completed: true,
      diagnosis_result: result,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) throw error;
}

export async function getPracticeHistory(
  userId: string,
  limit = 50
): Promise<PracticeHistoryRow[]> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("user_practice_history")
    .select("*")
    .eq("user_id", userId)
    .order("completed_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as PracticeHistoryRow[];
}

export async function savePracticeHistory(
  params: PracticeHistoryInsert
): Promise<string> {
  const supabase = createSupabaseAdmin();
  const id = crypto.randomUUID();

  const { error } = await supabase.from("user_practice_history").insert({
    id,
    user_id: params.userId,
    case_id: params.caseId,
    difficulty: params.difficulty,
    scores: params.scores,
    overall_score: params.overallScore,
  });

  if (error) throw error;
  return id;
}
