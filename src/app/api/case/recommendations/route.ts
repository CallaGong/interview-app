import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  buildCaseRecommendation,
  type PracticeHistoryRow,
} from "@/lib/case/recommendations";
import {
  getPracticeHistory,
  getUserPreferences,
} from "@/lib/db/case-practice";
import { getCaseQuestions } from "@/lib/cases/catalog";
import {
  CASE_DB_SETUP_HINT,
  getSupabaseErrorMessage,
  isMissingTableError,
} from "@/lib/supabase/errors";
import type { CaseLocale } from "@/types/case-locale";
import type { CaseDifficulty } from "@/types";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const locale = (searchParams.get("locale") === "zh" ? "zh" : "en") as CaseLocale;

    const [preferences, historyRows] = await Promise.all([
      getUserPreferences(userId),
      getPracticeHistory(userId),
    ]);

    const baseDifficulty: CaseDifficulty =
      preferences?.recommended_difficulty ?? "medium";

    const history: PracticeHistoryRow[] = historyRows.map((row) => ({
      case_id: row.case_id,
      difficulty: row.difficulty,
      overall_score: row.overall_score,
      completed_at: row.completed_at,
    }));

    const cases = getCaseQuestions(locale);
    const recommendation = buildCaseRecommendation({
      cases,
      baseDifficulty,
      history,
    });

    return NextResponse.json({
      preferences,
      recommendation,
      diagnosisCompleted: preferences?.diagnosis_completed ?? false,
    });
  } catch (e) {
    console.error("[case/recommendations GET]", e);
    const missing = isMissingTableError(e);
    return NextResponse.json(
      {
        error: missing
          ? `Case practice tables are missing. ${CASE_DB_SETUP_HINT}`
          : getSupabaseErrorMessage(e),
        code: missing ? "MISSING_TABLE" : "DB_ERROR",
      },
      { status: missing ? 503 : 500 }
    );
  }
}
