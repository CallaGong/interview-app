export function createSseStream(stream: AsyncIterable<unknown>): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const raw of stream) {
          const chunk = raw as {
            type?: string;
            delta?: { type?: string; text?: string };
          };
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta?.type === "text_delta"
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
        const message =
          err instanceof Error
            ? err.message.includes("not_found_error")
              ? "AI model unavailable. Set CLAUDE_MODEL=claude-sonnet-4-6 in .env.local"
              : err.message
            : "Stream interrupted";
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: message })}\n\n`)
        );
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
