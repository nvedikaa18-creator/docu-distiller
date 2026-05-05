// Client-side document text extraction
import * as pdfjsLib from "pdfjs-dist";
// Vite worker import
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

export async function extractText(file: File): Promise<string> {
  if (file.type === "text/plain" || file.name.toLowerCase().endsWith(".txt")) {
    return await file.text();
  }
  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    const buf = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
    let full = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const text = content.items
        .map((it) => ("str" in it ? (it as { str: string }).str : ""))
        .join(" ");
      full += text + "\n\n";
    }
    return full;
  }
  throw new Error("Unsupported file type. Please upload a PDF or TXT file.");
}

// ~4 chars/token heuristic. Chunk by characters with overlap.
export function chunkText(text: string, chunkChars = 12000, overlap = 800): string[] {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= chunkChars) return [cleaned];
  const chunks: string[] = [];
  let i = 0;
  while (i < cleaned.length) {
    const end = Math.min(i + chunkChars, cleaned.length);
    chunks.push(cleaned.slice(i, end));
    if (end === cleaned.length) break;
    i = end - overlap;
  }
  return chunks;
}

export function previewWords(text: string, maxWords = 800): string {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return words.join(" ");
  return words.slice(0, maxWords).join(" ") + " …";
}
