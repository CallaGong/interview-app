import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const audioFile = formData.get("audio") as File | null;
    const language = (formData.get("language") as string) || "en";

    if (!audioFile) {
      return NextResponse.json({ error: "No audio" }, { status: 400 });
    }

    const openaiFormData = new FormData();
    openaiFormData.append("file", audioFile);
    openaiFormData.append("model", "whisper-1");
    openaiFormData.append("language", language === "zh" ? "zh" : "en");
    openaiFormData.append("response_format", "json");

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: openaiFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Whisper error:", errorText);
      return NextResponse.json({ error: "Transcription failed" }, { status: 500 });
    }

    const data = (await response.json()) as { text?: string };
    return NextResponse.json({ text: data.text ?? "" });
  } catch (err) {
    console.error("Voice transcribe error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
