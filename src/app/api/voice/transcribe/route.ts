import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

function extensionForMimeType(mimeType: string): string {
  if (mimeType.includes("mp4") || mimeType.includes("m4a")) return "mp4";
  if (mimeType.includes("webm")) return "webm";
  if (mimeType.includes("mpeg") || mimeType.includes("mp3")) return "mp3";
  if (mimeType.includes("wav")) return "wav";
  return "webm";
}

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
    const mimeTypeRaw = formData.get("mimeType");
    const mimeType =
      typeof mimeTypeRaw === "string" && mimeTypeRaw.trim()
        ? mimeTypeRaw.trim()
        : audioFile?.type || "audio/webm";
    const language = (formData.get("language") as string) || "en";

    if (!audioFile) {
      return NextResponse.json({ error: "No audio" }, { status: 400 });
    }

    const ext = extensionForMimeType(mimeType);
    const audioBuffer = await audioFile.arrayBuffer();
    const whisperFile = new File([audioBuffer], `recording.${ext}`, {
      type: mimeType,
    });

    console.log("[voice/transcribe] received:", {
      originalName: audioFile.name,
      originalType: audioFile.type,
      mimeType,
      ext,
      size: audioBuffer.byteLength,
      language,
    });

    const openaiFormData = new FormData();
    openaiFormData.append("file", whisperFile);
    openaiFormData.append("model", "whisper-1");
    openaiFormData.append("language", language === "zh" ? "zh" : "en");
    openaiFormData.append("response_format", "json");

    console.log("[voice/transcribe] calling Whisper API...");

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: openaiFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[voice/transcribe] Whisper error:", response.status, errorText);
      return NextResponse.json({ error: "Transcription failed" }, { status: 500 });
    }

    const data = (await response.json()) as { text?: string };
    const text = data.text ?? "";
    console.log("[voice/transcribe] result length:", text.length);

    return NextResponse.json({ text });
  } catch (err) {
    console.error("[voice/transcribe] server error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
