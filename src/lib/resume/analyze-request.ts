import { NextRequest, NextResponse } from "next/server";
import { anthropic, CLAUDE_MODEL } from "@/lib/anthropic";
import { extractTextFromPdf } from "@/lib/pdf";
import { RESUME_API_ERRORS } from "@/lib/resume/i18n";
import { parseResumeFeedback } from "@/lib/resume/parse-feedback";
import type { ResumeLocale } from "@/types/resume";

const MAX_FILE_BYTES = 10 * 1024 * 1024;

function textLength(text: string): number {
  return text.replace(/\s/g, "").length;
}

const MIN_TEXT_LENGTH = 50;

const JSON_RETRY = {
  en: "Your last reply was not valid JSON. Respond again with ONLY valid JSON matching the schema. Escape all double quotes inside strings. No markdown fences.",
  zh: "上一次回复不是合法 JSON。请仅返回符合 schema 的有效 JSON，字符串内的双引号须转义，不要使用 markdown 代码块。",
} as const;

export async function handleResumeAnalyze(
  req: NextRequest,
  systemPrompt: string,
  buildUserMessage: (text: string) => string,
  dimensionKeys: string[],
  locale: ResumeLocale = "en"
) {
  const err = RESUME_API_ERRORS[locale];

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: err.noApiKey }, { status: 500 });
  }

  const formData = await req.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: err.noFile }, { status: 400 });
  }

  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    return NextResponse.json({ error: err.pdfOnly }, { status: 400 });
  }

  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: err.tooLarge }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  let resumeText: string;

  try {
    resumeText = await extractTextFromPdf(buffer);
  } catch (pdfErr) {
    console.error("PDF parse error:", pdfErr);
    return NextResponse.json({ error: err.parseFailed }, { status: 400 });
  }

  if (!resumeText || textLength(resumeText) < MIN_TEXT_LENGTH) {
    return NextResponse.json({ error: err.notEnoughText }, { status: 400 });
  }

  const userMessage = buildUserMessage(resumeText);
  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  const content = response.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude");
  }

  let rawText = content.text;
  let feedback;
  try {
    feedback = parseResumeFeedback(rawText, dimensionKeys, locale);
  } catch (parseErr) {
    console.warn("Resume JSON parse failed, retrying once:", parseErr);
    const retry = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        { role: "user", content: userMessage },
        { role: "assistant", content: rawText },
        { role: "user", content: JSON_RETRY[locale] },
      ],
    });
    const retryContent = retry.content[0];
    if (retryContent.type !== "text") {
      throw parseErr;
    }
    rawText = retryContent.text;
    feedback = parseResumeFeedback(rawText, dimensionKeys, locale);
  }

  return NextResponse.json({ feedback, fileName: file.name });
}
