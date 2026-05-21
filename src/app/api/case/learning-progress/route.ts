import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  normalizeLearningProgress,
  type LearningProgress,
} from "@/lib/case/learning/types";
import {
  ensureUserPreferencesRow,
  getUserPreferences,
  saveLearningProgress,
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

    await ensureUserPreferencesRow(userId);
    const preferences = await getUserPreferences(userId);
    const learningProgress = normalizeLearningProgress(
      preferences?.learning_progress
    );

    return NextResponse.json({ learningProgress });
  } catch (e) {
    console.error("[case/learning-progress GET]", e);
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

export async function PATCH(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as { learningProgress?: LearningProgress };
    if (!body.learningProgress?.section1) {
      return NextResponse.json({ error: "Invalid learningProgress" }, { status: 400 });
    }

    const learningProgress = normalizeLearningProgress(body.learningProgress);
    await saveLearningProgress(userId, learningProgress);

    return NextResponse.json({ learningProgress });
  } catch (e) {
    console.error("[case/learning-progress PATCH]", e);
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
