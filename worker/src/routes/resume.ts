import { getAnthropic, getModel } from "../lib/anthropic";
import { saveResumeAnalysis } from "../lib/db";
import { errorResponse, jsonResponse } from "../lib/cors";
import { uploadResumePdf } from "../lib/r2";
import type { Env } from "../env";

const RESUME_SYSTEM_PROMPT = `你是咨询行业求职顾问，分析简历并只返回 JSON 格式的改善建议。`;

export async function handleResumeUpload(request: Request, env: Env): Promise<Response> {
  if (request.method !== "POST") return errorResponse("Method not allowed", 405);
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const userId = (formData.get("userId") as string) || "anonymous";
    if (!file || !(file instanceof File)) return errorResponse("请上传 PDF 文件", 400);
    const { key, size } = await uploadResumePdf(env, userId, file);
    return jsonResponse({ key, size, fileName: file.name });
  } catch (err) {
    console.error("Resume upload error:", err);
    return errorResponse("上传失败", 500);
  }
}

export async function handleResumeAnalyze(request: Request, env: Env): Promise<Response> {
  if (request.method !== "POST") return errorResponse("Method not allowed", 405);
  if (!env.ANTHROPIC_API_KEY) return errorResponse("请配置 ANTHROPIC_API_KEY", 500);
  try {
    const body = (await request.json()) as { resumeText?: string; userId?: string; r2Key?: string };
    const resumeText = body.resumeText?.trim();
    if (!resumeText || resumeText.length < 100) return errorResponse("简历内容太短", 400);
    const response = await getAnthropic(env).messages.create({
      model: getModel(env),
      max_tokens: 2000,
      system: RESUME_SYSTEM_PROMPT,
      messages: [{ role: "user", content: `请分析以下简历：\n\n${resumeText}` }],
    });
    const content = response.content[0];
    if (content.type !== "text") throw new Error("Unexpected response");
    const feedback = JSON.parse(content.text.replace(/```json\n?|\n?```/g, "").trim());
    await saveResumeAnalysis(env, {
      userId: body.userId || "anonymous",
      originalText: resumeText,
      feedback,
      overallScore: (feedback as { overall_score?: number }).overall_score,
      r2Key: body.r2Key,
    });
    return jsonResponse({ feedback });
  } catch (err) {
    console.error("Resume analyze error:", err);
    return errorResponse("分析失败，请重试", 500);
  }
}
