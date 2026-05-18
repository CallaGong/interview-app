import { NextRequest, NextResponse } from "next/server";
import { anthropic, CLAUDE_MODEL } from "@/lib/anthropic";
import { saveResumeAnalysis } from "@/lib/db/resume";

const RESUME_SYSTEM_PROMPT = `你是咨询行业求职顾问，分析简历并只返回 JSON 格式的改善建议。`;

export async function POST(req: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "请配置 ANTHROPIC_API_KEY 环境变量" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const resumeText = (body.resumeText as string)?.trim();
    const userId = (body.userId as string) || "anonymous";
    const storagePath = body.storagePath as string | undefined;

    if (!resumeText || resumeText.length < 100) {
      return NextResponse.json({ error: "简历内容太短" }, { status: 400 });
    }

    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 2000,
      system: RESUME_SYSTEM_PROMPT,
      messages: [{ role: "user", content: `请分析以下简历：\n\n${resumeText}` }],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type");
    }

    const feedback = JSON.parse(
      content.text.replace(/```json\n?|\n?```/g, "").trim()
    );

    await saveResumeAnalysis({
      userId,
      originalText: resumeText,
      feedback,
      overallScore: (feedback as { overall_score?: number }).overall_score,
      storagePath,
    });

    return NextResponse.json({ feedback });
  } catch (err) {
    console.error("Resume analyze error:", err);
    return NextResponse.json({ error: "分析失败，请重试" }, { status: 500 });
  }
}
