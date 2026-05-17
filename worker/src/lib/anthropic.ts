import Anthropic from "@anthropic-ai/sdk";
import type { Env } from "../env";

export function getAnthropic(env: Env) {
  return new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
}

export function getModel(env: Env): string {
  return env.CLAUDE_MODEL || "claude-sonnet-4-20250514";
}

type StreamEvent = { type: string; delta?: { type: string; text?: string } };

export function sseStream(stream: AsyncIterable<StreamEvent>): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (chunk.type === "content_block_delta" && chunk.delta?.type === "text_delta") {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`));
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } finally {
        controller.close();
      }
    },
  });
}

export const sseHeaders = {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache",
  Connection: "keep-alive",
};
