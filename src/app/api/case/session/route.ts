import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { buildCaseOpeningMessage } from "@/lib/prompts/case";
import {
  abandonInProgressSessions,
  createCasePracticeSession,
  findActiveCaseSession,
  getSessionForUser,
  getSessionMessages,
  sessionCaseSlug,
  updateSessionStatus,
  type PracticeSessionStatus,
} from "@/lib/db/case-sessions";
import { getCaseQuestions } from "@/lib/cases/catalog";
import {
  CASE_SESSION_SETUP_HINT,
  getSupabaseErrorMessage,
  isCaseSessionTableMissingError,
} from "@/lib/supabase/errors";
import { parseCaseLocale } from "@/types/case-locale";
import type { CaseQuestion } from "@/types";

function dbErrorResponse(e: unknown) {
  const missing = isCaseSessionTableMissingError(e);
  return NextResponse.json(
    {
      error: missing
        ? `Case session tables are missing. ${CASE_SESSION_SETUP_HINT}`
        : getSupabaseErrorMessage(e),
      code: missing ? "MISSING_TABLE" : "DB_ERROR",
    },
    { status: missing ? 503 : 500 }
  );
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // caseId query param is the catalog slug (e.g. coffee-china), not a UUID
    const caseSlug = req.nextUrl.searchParams.get("caseId");
    if (!caseSlug) {
      return NextResponse.json({ error: "caseId is required" }, { status: 400 });
    }

    const locale = parseCaseLocale(req.nextUrl.searchParams.get("locale"));
    const session = await findActiveCaseSession(userId, caseSlug, locale);
    if (!session) {
      return NextResponse.json({ session: null, messages: [] });
    }

    const messages = await getSessionMessages(session.id);
    return NextResponse.json({
      session: {
        id: session.id,
        caseId: sessionCaseSlug(session),
        status: session.status,
        locale: session.locale,
        updatedAt: session.updated_at,
      },
      messages,
      resumed: true,
    });
  } catch (e) {
    console.error("[case/session GET]", e);
    return dbErrorResponse(e);
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as {
      caseId: string;
      locale?: string;
      caseQuestion?: CaseQuestion;
      abandonPrevious?: boolean;
    };

    if (!body.caseId) {
      return NextResponse.json({ error: "caseId is required" }, { status: 400 });
    }

    const locale = parseCaseLocale(body.locale);

    if (body.abandonPrevious !== false) {
      await abandonInProgressSessions(userId, body.caseId, locale);
    }

    let caseQuestion = body.caseQuestion;
    if (!caseQuestion) {
      const catalog = getCaseQuestions(locale);
      caseQuestion = catalog.find((c) => c.id === body.caseId);
    }
    if (!caseQuestion) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    const openingMessage = buildCaseOpeningMessage(caseQuestion, locale);
    const { session, messages } = await createCasePracticeSession({
      userId,
      caseSlug: body.caseId,
      locale,
      openingMessage,
    });

    return NextResponse.json({
      session: {
        id: session.id,
        caseId: sessionCaseSlug(session),
        status: session.status,
        locale: session.locale,
        updatedAt: session.updated_at,
      },
      messages,
      resumed: false,
    });
  } catch (e) {
    console.error("[case/session POST]", e);
    return dbErrorResponse(e);
  }
}

export async function PATCH(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as {
      sessionId: string;
      status: PracticeSessionStatus;
    };

    if (!body.sessionId || !body.status) {
      return NextResponse.json(
        { error: "sessionId and status are required" },
        { status: 400 }
      );
    }

    const allowed: PracticeSessionStatus[] = [
      "in_progress",
      "completed",
      "abandoned",
    ];
    if (!allowed.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const session = await getSessionForUser(body.sessionId, userId);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    await updateSessionStatus(body.sessionId, userId, body.status);

    return NextResponse.json({
      session: {
        id: body.sessionId,
        status: body.status,
      },
    });
  } catch (e) {
    console.error("[case/session PATCH]", e);
    return dbErrorResponse(e);
  }
}
