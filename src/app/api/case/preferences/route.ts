import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { CaseDiagnosisAnswers } from "@/lib/case/diagnosis";
import { diagnoseFromAnswers } from "@/lib/case/diagnosis";
import {
  getUserPreferences,
  saveDiagnosisResult,
} from "@/lib/db/case-practice";
import {
  CASE_DB_SETUP_HINT,
  getSupabaseErrorMessage,
  isMissingTableError,
} from "@/lib/supabase/errors";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const preferences = await getUserPreferences(userId);
    return NextResponse.json({ preferences });
  } catch (e) {
    console.error("[case/preferences GET]", e);
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

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as { answers: CaseDiagnosisAnswers };
    if (!body.answers?.experience || !body.answers?.mockInterview) {
      return NextResponse.json({ error: "Invalid answers" }, { status: 400 });
    }

    const frameworks = Array.isArray(body.answers.frameworks)
      ? body.answers.frameworks
      : [];

    const result = diagnoseFromAnswers({
      experience: body.answers.experience,
      frameworks,
      mockInterview: body.answers.mockInterview,
    });

    await saveDiagnosisResult(userId, result);

    return NextResponse.json({ result, preferences: await getUserPreferences(userId) });
  } catch (e) {
    console.error("[case/preferences POST]", e);
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
