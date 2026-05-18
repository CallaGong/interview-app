type PdfParseFn = (
  buffer: Buffer,
  options?: { max?: number }
) => Promise<{ text: string; numpages: number }>;

/** Import lib entry directly — package index triggers debug self-test in ESM. */
export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const mod = await import("pdf-parse/lib/pdf-parse.js");
  const pdfParse = (mod.default ?? mod) as PdfParseFn;
  const data = await pdfParse(buffer);
  return data.text.trim();
}
