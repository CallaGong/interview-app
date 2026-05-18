import { NextRequest, NextResponse } from "next/server";
import { listCaseQuestions } from "@/lib/db/cases";
import { parseCaseLocale } from "@/types/case-locale";

export async function GET(req: NextRequest) {
  try {
    const locale = parseCaseLocale(req.nextUrl.searchParams.get("locale"));
    const cases = await listCaseQuestions(locale);
    return NextResponse.json({ cases, locale });
  } catch (err) {
    console.error("List cases error:", err);
    return NextResponse.json({ error: "Failed to load cases" }, { status: 500 });
  }
}
