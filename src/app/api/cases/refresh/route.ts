import { NextRequest, NextResponse } from "next/server";
import { listCaseQuestions } from "@/lib/db/cases";
import { parseCaseLocale } from "@/types/case-locale";

export async function POST(req: NextRequest) {
  try {
    const locale = parseCaseLocale(req.nextUrl.searchParams.get("locale"));
    const cases = await listCaseQuestions(locale);
    return NextResponse.json({ ok: true, count: cases.length, locale });
  } catch (err) {
    console.error("Refresh cases error:", err);
    return NextResponse.json({ error: "Failed to refresh cases" }, { status: 500 });
  }
}
