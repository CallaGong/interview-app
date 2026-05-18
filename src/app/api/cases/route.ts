import { NextResponse } from "next/server";
import { listCaseQuestions } from "@/lib/db/cases";

export async function GET() {
  try {
    const cases = await listCaseQuestions();
    return NextResponse.json({ cases });
  } catch (err) {
    console.error("List cases error:", err);
    return NextResponse.json({ error: "获取题库失败" }, { status: 500 });
  }
}
