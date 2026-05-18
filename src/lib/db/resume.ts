import { createSupabaseAdmin } from "@/lib/supabase/admin";

export async function saveResumeAnalysis(params: {
  userId: string;
  sessionId?: string;
  originalText?: string;
  feedback: unknown;
  overallScore?: number;
  storagePath?: string;
}): Promise<string> {
  const supabase = createSupabaseAdmin();
  const id = crypto.randomUUID();

  const { error } = await supabase.from("resume_analyses").insert({
    id,
    session_id: params.sessionId ?? null,
    user_id: params.userId,
    original_text: params.originalText ?? null,
    feedback: params.feedback,
    overall_score: params.overallScore ?? null,
    storage_path: params.storagePath ?? null,
  });

  if (error) throw error;
  return id;
}
