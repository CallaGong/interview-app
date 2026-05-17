import { getCaseQuestions, invalidateCaseCache } from "../lib/kv-cases";
import { corsPreflight, errorResponse, jsonResponse } from "../lib/cors";
import type { Env } from "../env";

export async function handleListCases(request: Request, env: Env): Promise<Response> {
  if (request.method === "OPTIONS") return corsPreflight();
  if (request.method !== "GET") return errorResponse("Method not allowed", 405);
  try {
    return jsonResponse({ cases: await getCaseQuestions(env) });
  } catch (err) {
    console.error("List cases error:", err);
    return errorResponse("获取题库失败", 500);
  }
}

export async function handleRefreshCases(request: Request, env: Env): Promise<Response> {
  if (request.method !== "POST") return errorResponse("Method not allowed", 405);
  try {
    await invalidateCaseCache(env);
    const cases = await getCaseQuestions(env);
    return jsonResponse({ ok: true, count: cases.length });
  } catch (err) {
    return errorResponse("刷新缓存失败", 500);
  }
}
