import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { anthropic, CLAUDE_MODEL } from "@/lib/anthropic";
import { getBranchingTree } from "@/lib/case/branching/case-trees";
import { parseNodeMarker } from "@/lib/case/live/parse-node";
import { buildLiveSystemPrompt } from "@/lib/case/live/prompts";
import {
  getLiveSessionForUser,
  insertLiveChatMessages,
  sessionCaseSlug,
  updateLiveSessionNodes,
} from "@/lib/db/case-sessions";
import { getCaseById } from "@/lib/cases/catalog";
import { createSseStream, sseHeaders } from "@/lib/sse";
import {
  CASE_SESSION_SETUP_HINT,
  getSupabaseErrorMessage,
  isCaseSessionTableMissingError,
} from "@/lib/supabase/errors";
import { parseCaseLocale } from "@/types/case-locale";
import type { ChatMessage } from "@/types";

function resolveCurrentNodeId(
  session: { visited_nodes?: string[] | null },
  treeRoot: string
): string {
  const visited = session.visited_nodes ?? [];
  return visited[visited.length - 1] ?? treeRoot;
}

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
    const sessionId = String(body.sessionId ?? "");
    const userMessage = String(body.userMessage ?? "").trim();
    const locale = parseCaseLocale(body.locale ?? body.language);
    const caseId = String(body.caseId ?? "");

    if (!sessionId || !userMessage) {
      return NextResponse.json(
        { error: "sessionId and userMessage are required" },
        { status: 400 }
      );
    }

    const session = await getLiveSessionForUser(sessionId, userId);
    if (!session) {
      return NextResponse.json({ error: "Live session not found" }, { status: 404 });
    }
    if (session.status !== "in_progress") {
      return NextResponse.json(
        { error: "Session is not active" },
        { status: 400 }
      );
    }

    const slug = sessionCaseSlug(session) ?? caseId;
    if (!slug) {
      return NextResponse.json({ error: "Case not set on session" }, { status: 400 });
    }

    const tree = getBranchingTree(slug);
    if (!tree) {
      return NextResponse.json(
        { error: "Branching tree not found" },
        { status: 400 }
      );
    }

    const caseQuestion = getCaseById(slug, locale);
    if (!caseQuestion) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    const currentNodeId = resolveCurrentNodeId(session, tree.rootNode);
    const systemPrompt = buildLiveSystemPrompt({
      caseQuestion,
      locale,
      tree,
      currentNodeId,
    });

    const history = (body.messages as ChatMessage[] | undefined) ?? [];
    const apiMessages: ChatMessage[] = [
      ...history,
      { role: "user", content: userMessage },
    ];

    const stream = await anthropic.messages.stream({
      model: CLAUDE_MODEL,
      max_tokens: 1200,
      system: systemPrompt,
      messages: apiMessages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    return new Response(
      createSseStream(stream, {
        onComplete: async (fullContent) => {
          if (!fullContent.trim()) return;
          const { displayContent, nextNodeId } = parseNodeMarker(fullContent);
          const resolvedNode = nextNodeId ?? currentNodeId;
          const visited = [...(session.visited_nodes ?? [])];
          if (!visited.includes(resolvedNode)) {
            visited.push(resolvedNode);
          }

          try {
            await insertLiveChatMessages(
              sessionId,
              userId,
              {
                role: "user",
                content: userMessage,
                nodeId: currentNodeId,
                messageType: "normal",
              },
              {
                role: "assistant",
                content: displayContent,
                nodeId: resolvedNode,
                messageType: "normal",
                metadata: { raw_with_marker: fullContent },
              }
            );
            await updateLiveSessionNodes(sessionId, userId, visited);
          } catch (saveErr) {
            console.error("[case/live/chat] save error:", saveErr);
          }
        },
      }),
      {
        headers: {
          ...sseHeaders,
          "X-Live-Node": currentNodeId,
        },
      }
    );
  } catch (error) {
    console.error("[case/live/chat] error:", error);
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
