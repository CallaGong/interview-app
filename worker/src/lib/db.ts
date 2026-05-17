import type { CaseQuestion, CaseQuestionRow, Env, SessionType } from "../env";

export function rowToCaseQuestion(row: CaseQuestionRow): CaseQuestion {
  return {
    id: row.id,
    title: row.title,
    type: row.type,
    difficulty: row.difficulty,
    description: row.description,
    context: row.context ?? "",
    key_issues: JSON.parse(row.key_issues) as string[],
  };
}

export async function listCaseQuestionsFromD1(env: Env): Promise<CaseQuestion[]> {
  const { results } = await env.DB.prepare(
    `SELECT id, title, type, difficulty, description, context, key_issues FROM case_questions ORDER BY created_at ASC`
  ).all<CaseQuestionRow>();
  return (results ?? []).map(rowToCaseQuestion);
}

export async function saveResumeAnalysis(
  env: Env,
  params: { userId: string; sessionId?: string; originalText?: string; feedback: unknown; overallScore?: number; r2Key?: string }
): Promise<string> {
  const id = crypto.randomUUID();
  await env.DB.prepare(
    `INSERT INTO resume_analyses (id, session_id, user_id, original_text, feedback, overall_score, r2_key) VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, params.sessionId ?? null, params.userId, params.originalText ?? null, JSON.stringify(params.feedback), params.overallScore ?? null, params.r2Key ?? null).run();
  return id;
}
