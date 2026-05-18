import { NextRequest, NextResponse } from "next/server";
import { anthropic, CLAUDE_MODEL } from "@/lib/anthropic";
import {
  getDimensionById,
  pickInterviewDimensions,
} from "@/lib/interview/dimensions";
import { buildInterviewSystemPrompt } from "@/lib/prompts/interview";
import type { InterviewLocale } from "@/types/interview";
import { createSseStream, sseHeaders } from "@/lib/sse";
import type { ChatMessage } from "@/types";

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
    const resumeText = (body.resumeText as string | null) ?? null;
    const endInterview = Boolean(body.endInterview);
    const locale = (body.locale === "zh" ? "zh" : "en") as InterviewLocale;
    const dimensionIds = (body.focusDimensionIds as string[] | undefined) ?? [];

    if (!messages?.length) {
      return NextResponse.json(
        { error: "Missing message history" },
        { status: 400 }
      );
    }

    const resolvedIds = dimensionIds.length ? dimensionIds : [];
    const focusDimensions =
      resolvedIds.length > 0
        ? resolvedIds
            .map((id) => getDimensionById(id, locale))
            .filter((d): d is NonNullable<typeof d> => Boolean(d))
        : pickInterviewDimensions(locale);

    const systemPrompt = buildInterviewSystemPrompt(
      resumeText,
      focusDimensions,
      endInterview,
      locale
    );

    const stream = await anthropic.messages.stream({
      model: CLAUDE_MODEL,
      max_tokens: endInterview ? 4096 : 1400,
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    return new Response(createSseStream(stream), { headers: sseHeaders });
  } catch (error) {
    console.error("Interview chat error:", error);
    const message =
      error instanceof Error ? error.message : "Chat failed. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
