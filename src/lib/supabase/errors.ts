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

function getErrorCode(error: unknown): string | undefined {
  if (!error || typeof error !== "object") return undefined;
  return (error as { code?: string }).code?.toUpperCase();
}

/**
 * True only when a table/relation is missing — not column errors, constraints, or UUID issues.
 */
export function isPostgrestTableNotFound(
  error: unknown,
  tableNames: string[]
): boolean {
  const code = getErrorCode(error);
  const message = getSupabaseErrorMessage(error).toLowerCase();

  if (code === "PGRST205") {
    if (!tableNames.length) return true;
    return tableNames.some((t) => message.includes(t.toLowerCase()));
  }

  if (code === "42P01") {
    if (message.includes("column")) return false;
    if (!tableNames.length) return message.includes("does not exist");
    return tableNames.some(
      (t) =>
        message.includes(`"${t.toLowerCase()}"`) && message.includes("does not exist")
    );
  }

  if (message.includes("could not find the table")) {
    return tableNames.some((t) => message.includes(t.toLowerCase()));
  }

  return false;
}

/** user_preferences / user_practice_history (diagnosis, history, learning). */
export function isMissingTableError(error: unknown): boolean {
  return isPostgrestTableNotFound(error, [
    "user_preferences",
    "user_practice_history",
  ]);
}

/** practice_sessions / chat_messages only. */
export function isCaseSessionTableMissingError(error: unknown): boolean {
  return isPostgrestTableNotFound(error, ["practice_sessions", "chat_messages"]);
}

export const CASE_DB_SETUP_HINT =
  "Run supabase/migrations/0003_user_case_practice.sql through 0007 in the Supabase SQL Editor, or see scripts/setup-case-practice.sql.";

export const CASE_SESSION_SETUP_HINT =
  "Run scripts/setup-case-session-tables.sql in the Supabase SQL Editor (practice_sessions + chat_messages columns).";
