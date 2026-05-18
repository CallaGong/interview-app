import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    platform: "vercel",
    services: ["supabase", "nextjs"],
  });
}
