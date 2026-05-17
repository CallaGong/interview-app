import { corsPreflight, withCors } from "./lib/cors";
import { handleCaseChat } from "./routes/case-chat";
import { handleListCases, handleRefreshCases } from "./routes/cases";
import { handleInterviewChat } from "./routes/interview-chat";
import { handleResumeAnalyze, handleResumeUpload } from "./routes/resume";
import type { Env } from "./env";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS" && url.pathname.startsWith("/api/")) {
      return corsPreflight();
    }

    try {
      if (url.pathname === "/api/cases" && request.method === "GET") {
        return handleListCases(request, env);
      }
      if (url.pathname === "/api/cases/refresh" && request.method === "POST") {
        return handleRefreshCases(request, env);
      }
      if (url.pathname === "/api/case/chat" && request.method === "POST") {
        return withCors(await handleCaseChat(request, env));
      }
      if (url.pathname === "/api/interview/chat" && request.method === "POST") {
        return withCors(await handleInterviewChat(request, env));
      }
      if (url.pathname === "/api/resume/upload" && request.method === "POST") {
        return handleResumeUpload(request, env);
      }
      if (url.pathname === "/api/resume/analyze" && request.method === "POST") {
        return handleResumeAnalyze(request, env);
      }
      if (url.pathname === "/api/health") {
        return withCors(
          Response.json({
            ok: true,
            platform: "cloudflare",
            services: ["d1", "kv", "r2", "workers"],
          })
        );
      }
      return env.ASSETS.fetch(request);
    } catch (err) {
      console.error("Worker error:", err);
      return withCors(
        Response.json({ error: "Internal Server Error" }, { status: 500 })
      );
    }
  },
} satisfies ExportedHandler<Env>;
