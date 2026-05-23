import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  getBranchingTree,
  supportsLiveMode,
} from "@/lib/case/branching/case-trees";
import { buildLiveOpeningMessage } from "@/lib/case/live/prompts";
import {
  abandonInProgressSessions,
  createLivePracticeSession,
} from "@/lib/db/case-sessions";
import { getCaseById } from "@/lib/cases/catalog";
import {
  CASE_SESSION_SETUP_HINT,
  getSupabaseErrorMessage,
  isCaseSessionTableMissingError,
} from "@/lib/supabase/errors";
import { parseCaseLocale } from "@/types/case-locale";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const caseId = String(body.caseId ?? "");
    const locale = parseCaseLocale(body.language ?? body.locale);
    const durationSeconds = Number(
      body.durationSeconds ?? body.time_limit_seconds ?? 900
    );

    if (!caseId) {
      return NextResponse.json({ error: "caseId is required" }, { status: 400 });
    }

    if (!supportsLiveMode(caseId)) {
      return NextResponse.json(
        { error: "This case does not support Live Interview Mode" },
        { status: 400 }
      );
    }

    const tree = getBranchingTree(caseId);
    if (!tree) {
      return NextResponse.json(
        { error: "Branching tree not found" },
        { status: 400 }
      );
    }

    const caseQuestion = getCaseById(caseId, locale);
    if (!caseQuestion) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    const introNode = tree.nodes[tree.rootNode];
    const openingMessage = buildLiveOpeningMessage(
      caseQuestion,
      locale,
      introNode
    );

    await abandonInProgressSessions(userId, caseId, locale);

    const { session, messages } = await createLivePracticeSession({
      userId,
      caseSlug: caseId,
      locale,
      openingMessage,
      durationSeconds,
      rootNodeId: tree.rootNode,
    });

    return NextResponse.json({
      sessionId: session.id,
      currentNodeId: tree.rootNode,
      visitedNodes: [tree.rootNode],
      openingMessage: messages[0]?.content ?? openingMessage,
      timeLimitSeconds: durationSeconds,
      startedAt: session.started_at ?? new Date().toISOString(),
    });
  } catch (error) {
    console.error("[case/live] create error:", error);
    if (isCaseSessionTableMissingError(error)) {
      return NextResponse.json(
        {
          error: `Live mode tables are missing. ${CASE_SESSION_SETUP_HINT}`,
          code: "MISSING_TABLE",
        },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: getSupabaseErrorMessage(error) },
      { status: 500 }
    );
  }
}
