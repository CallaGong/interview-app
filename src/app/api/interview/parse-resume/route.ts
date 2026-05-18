import { NextRequest, NextResponse } from "next/server";
import { extractTextFromPdf } from "@/lib/pdf";

export const runtime = "nodejs";

const MAX_FILE_BYTES = 10 * 1024 * 1024;

function textLength(text: string): number {
  return text.replace(/\s/g, "").length;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "Please upload a PDF file" },
        { status: 400 }
      );
    }

    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      return NextResponse.json(
        { error: "Only PDF files are supported" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: "File is too large (max 10 MB)" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const text = await extractTextFromPdf(buffer);

    if (!text || textLength(text) < 50) {
      return NextResponse.json(
        {
          error:
            "Could not extract enough text. Use a text-based PDF export.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ text, fileName: file.name });
  } catch (err) {
    console.error("Interview parse-resume error:", err);
    return NextResponse.json(
      { error: "Could not read PDF. Try a text-based export." },
      { status: 400 }
    );
  }
}
