import { listCaseQuestionsFromD1 } from "./db";
import type { CaseQuestion, Env } from "../env";

const KV_CASES_KEY = "cases:all";

export async function getCaseQuestions(env: Env): Promise<CaseQuestion[]> {
  const cached = await env.CASE_CACHE.get(KV_CASES_KEY, "json");
  if (cached && Array.isArray(cached) && cached.length) return cached as CaseQuestion[];

  const fromDb = await listCaseQuestionsFromD1(env);
  if (fromDb.length) {
    await env.CASE_CACHE.put(KV_CASES_KEY, JSON.stringify(fromDb), { expirationTtl: 604800 });
  }
  return fromDb;
}

export async function invalidateCaseCache(env: Env): Promise<void> {
  await env.CASE_CACHE.delete(KV_CASES_KEY);
}
