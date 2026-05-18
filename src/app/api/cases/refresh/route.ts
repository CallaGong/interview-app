import { NextResponse } from "next/server";
import { listCaseQuestions } from "@/lib/db/cases";

export async function POST() {
  try {
    const cases = await listCaseQuestions();
    return NextResponse.json({ ok: true, count: cases.length });
  } catch (err) {
    console.error("Refresh cases error:", err);
    return NextResponse.json({ error: "刷新题库失败" }, { status: 500 });
  }
}
