/** Extract a readable message from Supabase/PostgREST errors. */
export function getSupabaseErrorMessage(error: unknown): string {
  if (!error || typeof error !== "object") {
    return "Unknown database error";
  }

  const record = error as {
    message?: string;
    details?: string;
    hint?: string;
    code?: string;
  };

  const parts = [record.message, record.details, record.hint].filter(Boolean);
  return parts.join(" — ") || "Database error";
}

export function isMissingTableError(error: unknown): boolean {
  const message = getSupabaseErrorMessage(error).toLowerCase();
  return (
    message.includes("user_preferences") ||
    message.includes("user_practice_history") ||
    message.includes("pgrst205") ||
    message.includes("could not find the table")
  );
}

export const CASE_DB_SETUP_HINT =
  "Run supabase/migrations/0003_user_case_practice.sql (and 0004) in the Supabase SQL Editor, or see scripts/setup-case-practice.sql.";
