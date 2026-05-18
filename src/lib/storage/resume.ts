import { createSupabaseAdmin } from "@/lib/supabase/admin";

const BUCKET = "resumes";

export async function uploadResumePdf(userId: string, file: File) {
  const supabase = createSupabaseAdmin();
  const path = `${userId}/${crypto.randomUUID()}.pdf`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType: file.type || "application/pdf",
    upsert: false,
  });

  if (error) throw error;
  return { path, size: file.size };
}
