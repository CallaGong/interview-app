import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { anthropic, CLAUDE_MODEL } from "@/lib/anthropic";
import {
  evaluateInterruptRules,
  type InterruptCheckInput,
} from "@/lib/case/live/interrupt-engine";

async function refineWithClaude(params: {
  input: InterruptCheckInput;
  ruleResult: ReturnType<typeof evaluateInterruptRules>;
}): Promise<{ should_interrupt: boolean; interrupt_message: string | null }> {
  const { input, ruleResult } = params;

  if (!ruleResult.should_interrupt) {
    return { should_interrupt: false, interrupt_message: null };
  }

  if (ruleResult.forced) {
    return {
      should_interrupt: true,
      interrupt_message: ruleResult.interrupt_message,
    };
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      should_interrupt: true,
      interrupt_message: ruleResult.interrupt_message,
    };
  }

  const lang = input.language === "zh" ? "Chinese" : "English";
  const prompt = `You are a case interview partner deciding whether to INTERRUPT the candidate mid-answer.

Rules already fired: ${ruleResult.reasons.join(", ") || "none"}
Suggested line: ${ruleResult.interrupt_message ?? "none"}
Candidate partial answer (${input.current_input.length} chars): """${input.current_input.slice(0, 800)}"""
Seconds since last interviewer spoke: ${input.time_since_last_ai}
Visited nodes: ${input.visited_nodes.join(", ")}

Reply in ${lang} with JSON only:
{"should_interrupt": true|false, "interrupt_message": "one short interviewer line or null"}

Interrupt if rules are valid OR the candidate is rambling/vague. Do not interrupt if they are concise and on-topic.`;

  try {
    const msg = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 120,
      messages: [{ role: "user", content: prompt }],
    });

    const block = msg.content.find((b) => b.type === "text");
    const raw = block?.type === "text" ? block.text : "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return {
        should_interrupt: true,
        interrupt_message: ruleResult.interrupt_message,
      };
    }
    const parsed = JSON.parse(jsonMatch[0]) as {
      should_interrupt?: boolean;
      interrupt_message?: string | null;
    };
    return {
      should_interrupt: Boolean(parsed.should_interrupt),
      interrupt_message:
        parsed.interrupt_message?.trim() || ruleResult.interrupt_message,
    };
  } catch {
    return {
      should_interrupt: true,
      interrupt_message: ruleResult.interrupt_message,
    };
  }
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const input: InterruptCheckInput = {
    current_input: String(body.current_input ?? body.userPartialText ?? ""),
    time_since_last_ai: Number(
      body.time_since_last_ai ?? body.timeSinceLastAi ?? 0
    ),
    visited_nodes: Array.isArray(body.visited_nodes)
      ? body.visited_nodes.map(String)
      : [],
    language: body.language === "zh" || body.locale === "zh" ? "zh" : "en",
    typing_duration_seconds: Number(
      body.typing_duration_seconds ?? body.typingDurationSeconds ?? 0
    ),
  };

  const ruleResult = evaluateInterruptRules(input);
  const refined = await refineWithClaude({ input, ruleResult });

  return NextResponse.json({
    should_interrupt: refined.should_interrupt,
    interrupt_message: refined.should_interrupt
      ? refined.interrupt_message
      : null,
    reasons: ruleResult.reasons,
  });
}
