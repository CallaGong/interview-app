import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { anthropic, CLAUDE_MODEL } from "@/lib/anthropic";
import {
  getSessionForUser,
  insertChatMessages,
  sessionCaseSlug,
} from "@/lib/db/case-sessions";
import { buildCaseSystemPrompt } from "@/lib/prompts/case";
import { createSseStream, sseHeaders } from "@/lib/sse";
import {
  CASE_SESSION_SETUP_HINT,
  getSupabaseErrorMessage,
  isCaseSessionTableMissingError,
} from "@/lib/supabase/errors";
import { parseCaseLocale } from "@/types/case-locale";
import type { CaseQuestion, ChatMessage } from "@/types";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "Please set ANTHROPIC_API_KEY in your environment" },
        { status: 500 }
      );
    }

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const messages = body.messages as ChatMessage[];
    const caseQuestion = body.caseQuestion as CaseQuestion;
    const locale = parseCaseLocale(body.locale);
    const sessionId = body.sessionId as string | undefined;

    if (!messages?.length || !caseQuestion) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role !== "user") {
      return NextResponse.json(
        { error: "Last message must be from the user" },
        { status: 400 }
      );
    }

    if (sessionId) {
      const session = await getSessionForUser(sessionId, userId);
      if (!session) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
      }
      if (session.status !== "in_progress") {
        return NextResponse.json(
          { error: "Session is not active" },
          { status: 400 }
        );
      }
      const slug = sessionCaseSlug(session);
      if (slug && slug !== caseQuestion.id) {
        return NextResponse.json({ error: "Case mismatch" }, { status: 400 });
      }
    }

    const systemPrompt = buildCaseSystemPrompt(caseQuestion, locale);
    const userContent = lastMessage.content;

    const stream = await anthropic.messages.stream({
      model: CLAUDE_MODEL,
      max_tokens: 1200,
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    return new Response(
      createSseStream(stream, {
        onComplete: async (fullContent) => {
          if (!sessionId || !fullContent.trim()) return;
          try {
            await insertChatMessages(
              sessionId,
              userId,
              { role: "user", content: userContent },
              { role: "assistant", content: fullContent }
            );
          } catch (saveErr) {
            console.error("[case/chat] Failed to save messages:", saveErr);
          }
        },
      }),
      { headers: sseHeaders }
    );
  } catch (error) {
    console.error("Case chat error:", error);
    if (isCaseSessionTableMissingError(error)) {
      return NextResponse.json(
        {
          error: `Case session tables are missing. ${CASE_SESSION_SETUP_HINT}`,
          code: "MISSING_TABLE",
        },
        { status: 503 }
      );
    }
    const message =
      error instanceof Error && "status" in error && (error as { status?: number }).status === 404
        ? `Model unavailable (${CLAUDE_MODEL}). Set CLAUDE_MODEL=claude-sonnet-4-6 in .env.local`
        : error instanceof Error
          ? error.message
          : "Chat failed. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
