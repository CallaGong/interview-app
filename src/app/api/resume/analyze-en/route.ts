import { NextRequest, NextResponse } from "next/server";
import {
  RESUME_EN_SYSTEM_PROMPT,
  buildResumeEnUserMessage,
} from "@/lib/prompts/resume-en";
import { handleResumeAnalyze } from "@/lib/resume/analyze-request";
import { RESUME_DIMENSION_KEYS_EN } from "@/types/resume";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    return await handleResumeAnalyze(
      req,
      RESUME_EN_SYSTEM_PROMPT,
      buildResumeEnUserMessage,
      [...RESUME_DIMENSION_KEYS_EN],
      "en"
    );
  } catch (err) {
    console.error("Resume analyze-en error:", err);
    return NextResponse.json(
      { error: "Analysis failed. Please try again." },
      { status: 500 }
    );
  }
}
