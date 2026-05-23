import type { CaseLocale } from "@/types/case-locale";
import type { ChatMessage } from "@/types";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export type PracticeSessionStatus = "in_progress" | "completed" | "abandoned";

export interface CasePracticeSessionRow {
  id: string;
  user_id: string;
  session_type: string;
  case_id: string | null;
  case_slug: string | null;
  status: PracticeSessionStatus;
  locale: string | null;
  created_at: string;
  updated_at: string;
}

const SESSION_EXPIRY_DAYS = 7;

function sessionExpiryCutoff(): string {
  const d = new Date();
  d.setDate(d.getDate() - SESSION_EXPIRY_DAYS);
  return d.toISOString();
}

export async function findActiveCaseSession(
  userId: string,
  caseSlug: string
): Promise<CasePracticeSessionRow | null> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("practice_sessions")
    .select("*")
    .eq("user_id", userId)
    .eq("session_type", "case")
    .eq("case_slug", caseSlug)
    .eq("status", "in_progress")
    .gt("updated_at", sessionExpiryCutoff())
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data as CasePracticeSessionRow | null;
}

export async function getSessionMessages(
  sessionId: string
): Promise<ChatMessage[]> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("chat_messages")
    .select("role, content")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row) => ({
    role: row.role as "user" | "assistant",
    content: row.content,
  }));
}

export async function createCasePracticeSession(params: {
  userId: string;
  caseSlug: string;
  locale: CaseLocale;
  openingMessage: string;
}): Promise<{ session: CasePracticeSessionRow; messages: ChatMessage[] }> {
  const supabase = createSupabaseAdmin();
  const now = new Date().toISOString();

  const { data: session, error: sessionError } = await supabase
    .from("practice_sessions")
    .insert({
      user_id: params.userId,
      session_type: "case",
      case_slug: params.caseSlug,
      status: "in_progress",
      locale: params.locale,
      updated_at: now,
    })
    .select("*")
    .single();

  if (sessionError) throw sessionError;

  const row = session as CasePracticeSessionRow;
  await insertChatMessages(row.id, params.userId, {
    role: "assistant",
    content: params.openingMessage,
  });

  return {
    session: row,
    messages: [{ role: "assistant", content: params.openingMessage }],
  };
}

export async function insertChatMessages(
  sessionId: string,
  userId: string,
  ...messages: ChatMessage[]
): Promise<void> {
  if (messages.length === 0) return;
  const supabase = createSupabaseAdmin();
  const { error } = await supabase.from("chat_messages").insert(
    messages.map((m) => ({
      session_id: sessionId,
      user_id: userId,
      role: m.role,
      content: m.content,
    }))
  );
  if (error) throw error;
  await touchSession(sessionId);
}

/** @deprecated Use insertChatMessages */
export const insertChatMessagePair = insertChatMessages;

export async function touchSession(sessionId: string): Promise<void> {
  const supabase = createSupabaseAdmin();
  const { error } = await supabase
    .from("practice_sessions")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", sessionId);
  if (error) throw error;
}

export async function updateSessionStatus(
  sessionId: string,
  userId: string,
  status: PracticeSessionStatus
): Promise<void> {
  const supabase = createSupabaseAdmin();
  const { error } = await supabase
    .from("practice_sessions")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", sessionId)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function getSessionForUser(
  sessionId: string,
  userId: string
): Promise<CasePracticeSessionRow | null> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("practice_sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("user_id", userId)
    .eq("session_type", "case")
    .maybeSingle();
  if (error) throw error;
  return data as CasePracticeSessionRow | null;
}

export async function abandonInProgressSessions(
  userId: string,
  caseSlug: string,
  exceptSessionId?: string
): Promise<void> {
  const supabase = createSupabaseAdmin();
  let query = supabase
    .from("practice_sessions")
    .update({ status: "abandoned", updated_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("case_slug", caseSlug)
    .eq("session_type", "case")
    .eq("status", "in_progress");

  if (exceptSessionId) {
    query = query.neq("id", exceptSessionId);
  }

  const { error } = await query;
  if (error) throw error;
}

export function sessionCaseSlug(session: CasePracticeSessionRow): string | null {
  return session.case_slug ?? session.case_id;
}
