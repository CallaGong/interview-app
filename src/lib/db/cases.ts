import { createSupabaseAdmin } from "@/lib/supabase/admin";
import type { CaseQuestion } from "@/types";

interface CaseQuestionRow {
  id: string;
  title: string;
  type: string;
  difficulty: "easy" | "medium" | "hard";
  description: string;
  context: string | null;
  key_issues: string[] | string;
}

function rowToCaseQuestion(row: CaseQuestionRow): CaseQuestion {
  const keyIssues =
    typeof row.key_issues === "string" ? JSON.parse(row.key_issues) : row.key_issues;
  return {
    id: row.id,
    title: row.title,
    type: row.type,
    difficulty: row.difficulty,
    description: row.description,
    context: row.context ?? "",
    key_issues: keyIssues,
  };
}

export async function listCaseQuestions(): Promise<CaseQuestion[]> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("case_questions")
    .select("id, title, type, difficulty, description, context, key_issues")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row) => rowToCaseQuestion(row as CaseQuestionRow));
}
