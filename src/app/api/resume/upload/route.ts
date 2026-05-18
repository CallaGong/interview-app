import { NextRequest, NextResponse } from "next/server";
import { uploadResumePdf } from "@/lib/storage/resume";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const userId = (formData.get("userId") as string) || "anonymous";

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "请上传 PDF 文件" }, { status: 400 });
    }

    const { path, size } = await uploadResumePdf(userId, file);
    return NextResponse.json({ path, size, fileName: file.name });
  } catch (err) {
    console.error("Resume upload error:", err);
    return NextResponse.json({ error: "上传失败" }, { status: 500 });
  }
}
