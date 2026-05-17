import type { Env } from "../env";

export async function uploadResumePdf(env: Env, userId: string, file: File) {
  const key = `resumes/${userId}/${crypto.randomUUID()}.pdf`;
  await env.RESUMES.put(key, file.stream(), {
    httpMetadata: { contentType: file.type || "application/pdf" },
  });
  return { key, size: file.size };
}
