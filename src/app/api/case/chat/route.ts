import { NextRequest, NextResponse } from "next/server";
import { anthropic, CLAUDE_MODEL } from "@/lib/anthropic";
import { buildCaseSystemPrompt } from "@/lib/prompts/case";
import { createSseStream, sseHeaders } from "@/lib/sse";
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

    const body = await req.json();
    const messages = body.messages as ChatMessage[];
    const caseQuestion = body.caseQuestion as CaseQuestion;
    const locale = parseCaseLocale(body.locale);

    if (!messages?.length || !caseQuestion) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const systemPrompt = buildCaseSystemPrompt(caseQuestion, locale);

    const stream = await anthropic.messages.stream({
      model: CLAUDE_MODEL,
      max_tokens: 1200,
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    return new Response(createSseStream(stream), { headers: sseHeaders });
  } catch (error) {
    console.error("Case chat error:", error);
    const message =
      error instanceof Error && "status" in error && (error as { status?: number }).status === 404
        ? `Model unavailable (${CLAUDE_MODEL}). Set CLAUDE_MODEL=claude-sonnet-4-6 in .env.local`
        : "Chat failed. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
