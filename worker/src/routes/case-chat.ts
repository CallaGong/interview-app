import { getAnthropic, getModel, sseHeaders, sseStream } from "../lib/anthropic";
import { buildCaseSystemPrompt } from "../prompts/case";
import { errorResponse } from "../lib/cors";
import type { CaseQuestion, ChatMessage, Env } from "../env";

export async function handleCaseChat(request: Request, env: Env): Promise<Response> {
  if (request.method !== "POST") return errorResponse("Method not allowed", 405);
  if (!env.ANTHROPIC_API_KEY) return errorResponse("请配置 ANTHROPIC_API_KEY", 500);

  try {
    const body = (await request.json()) as { messages: ChatMessage[]; caseQuestion: CaseQuestion };
    const { messages, caseQuestion } = body;
    if (!messages?.length || !caseQuestion) return errorResponse("缺少必要参数", 400);

    const stream = await getAnthropic(env).messages.stream({
      model: getModel(env),
      max_tokens: 1200,
      system: buildCaseSystemPrompt(caseQuestion),
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    return new Response(sseStream(stream), { headers: sseHeaders });
  } catch (err) {
    console.error("Case chat error:", err);
    return errorResponse("对话失败，请重试", 500);
  }
}
