import { getAnthropic, getModel, sseHeaders, sseStream } from "../lib/anthropic";
import { errorResponse } from "../lib/cors";
import type { ChatMessage, Env } from "../env";

const INTERVIEW_SYSTEM_PROMPT = `你是麦肯锡中国区资深招聘合伙人，进行行为面试。每次只问一个问题。用户说"结束"时返回 JSON 评分。`;

export async function handleInterviewChat(request: Request, env: Env): Promise<Response> {
  if (request.method !== "POST") return errorResponse("Method not allowed", 405);
  if (!env.ANTHROPIC_API_KEY) return errorResponse("请配置 ANTHROPIC_API_KEY", 500);
  try {
    const { messages } = (await request.json()) as { messages: ChatMessage[] };
    if (!messages?.length) return errorResponse("缺少消息记录", 400);
    const stream = await getAnthropic(env).messages.stream({
      model: getModel(env),
      max_tokens: 1000,
      system: INTERVIEW_SYSTEM_PROMPT,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });
    return new Response(sseStream(stream), { headers: sseHeaders });
  } catch (err) {
    console.error("Interview chat error:", err);
    return errorResponse("对话失败，请重试", 500);
  }
}
