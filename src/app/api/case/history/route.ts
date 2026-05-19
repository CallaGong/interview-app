import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { computeOverallScore } from "@/lib/case/recommendations";
import { savePracticeHistory } from "@/lib/db/case-practice";
import {
  CASE_DB_SETUP_HINT,
  getSupabaseErrorMessage,
  isMissingTableError,
} from "@/lib/supabase/errors";
import type { CaseDifficulty, CaseEvaluationScores } from "@/types";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as {
      caseId: string;
      difficulty: CaseDifficulty;
      scores: CaseEvaluationScores;
    };

    if (!body.caseId || !body.difficulty || !body.scores) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const overallScore = computeOverallScore(body.scores);
    const id = await savePracticeHistory({
      userId,
      caseId: body.caseId,
      difficulty: body.difficulty,
      scores: body.scores,
      overallScore,
    });

    return NextResponse.json({ id, overallScore });
  } catch (e) {
    console.error("[case/history POST]", e);
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
