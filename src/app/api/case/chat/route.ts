import { NextRequest, NextResponse } from "next/server";
import { anthropic, CLAUDE_MODEL } from "@/lib/anthropic";
import { buildCaseSystemPrompt } from "@/lib/prompts/case";
import type { CaseQuestion, ChatMessage } from "@/types";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "请配置 ANTHROPIC_API_KEY 环境变量" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const messages = body.messages as ChatMessage[];
    const caseQuestion = body.caseQuestion as CaseQuestion;

    if (!messages?.length || !caseQuestion) {
      return NextResponse.json({ error: "缺少必要参数" }, { status: 400 });
    }

    const systemPrompt = buildCaseSystemPrompt(caseQuestion);

    const stream = await anthropic.messages.stream({
      model: CLAUDE_MODEL,
      max_tokens: 1200,
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const readable = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of stream) {
            if (
              chunk.type === "content_block_delta" &&
              chunk.delta.type === "text_delta"
            ) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`
                )
              );
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        } catch (err) {
          console.error("Stream error:", err);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: "流式输出中断" })}\n\n`
            )
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Case chat error:", error);
    return NextResponse.json({ error: "对话失败，请重试" }, { status: 500 });
  }
}
