import { NextRequest, NextResponse } from "next/server";
import { anthropic, CLAUDE_MODEL } from "@/lib/anthropic";
import { createSseStream, sseHeaders } from "@/lib/sse";
import type { ChatMessage } from "@/types";

const INTERVIEW_SYSTEM_PROMPT = `你是麦肯锡中国区资深招聘合伙人，进行行为面试。每次只问一个问题。用户说"结束"时返回 JSON 评分。`;

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

    if (!messages?.length) {
      return NextResponse.json({ error: "缺少消息记录" }, { status: 400 });
    }

    const stream = await anthropic.messages.stream({
      model: CLAUDE_MODEL,
      max_tokens: 1000,
      system: INTERVIEW_SYSTEM_PROMPT,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    return new Response(createSseStream(stream), { headers: sseHeaders });
  } catch (error) {
    console.error("Interview chat error:", error);
    return NextResponse.json({ error: "对话失败，请重试" }, { status: 500 });
  }
}
