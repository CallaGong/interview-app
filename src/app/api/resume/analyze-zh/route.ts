import { NextRequest, NextResponse } from "next/server";
import {
  RESUME_ZH_SYSTEM_PROMPT,
  buildResumeZhUserMessage,
} from "@/lib/prompts/resume-zh";
import { handleResumeAnalyze } from "@/lib/resume/analyze-request";
import { RESUME_API_ERRORS } from "@/lib/resume/i18n";
import { RESUME_DIMENSION_KEYS_ZH } from "@/types/resume";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    return await handleResumeAnalyze(
      req,
      RESUME_ZH_SYSTEM_PROMPT,
      buildResumeZhUserMessage,
      [...RESUME_DIMENSION_KEYS_ZH],
      "zh"
    );
  } catch (err) {
    console.error("Resume analyze-zh error:", err);
    return NextResponse.json(
      { error: RESUME_API_ERRORS.zh.analyzeFailed },
      { status: 500 }
    );
  }
}
