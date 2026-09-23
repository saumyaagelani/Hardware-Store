/**
 * Minimal single-page PDF writer used for placeholder spec sheets / guides.
 * Produces a valid PDF 1.4 document using the built-in Helvetica font.
 */
function ascii(text: string): string {
  return text
    .replace(/[“”″]/g, '"')
    .replace(/[‘’′]/g, "'")
    .replace(/[–—]/g, "-")
    .replace(/×/g, "x")
    .replace(/·/g, "-")
    .replace(/[^\x20-\x7e]/g, "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function wrap(text: string, max: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    if ((line + " " + w).trim().length > max) {
      if (line) lines.push(line);
      line = w;
    } else line = (line + " " + w).trim();
  }
  if (line) lines.push(line);
  return lines;
}

export interface PdfLine {
  text: string;
  size?: number;
  bold?: boolean;
  gap?: number;
  color?: [number, number, number];
}

export function renderPdf(lines: PdfLine[]): Buffer {
  const ops: string[] = [];
  // Header band
  ops.push("0.067 0.094 0.153 rg 0 772 612 70 re f");
  ops.push("0.961 0.722 0.180 rg 0 768 612 4 re f");
  let y = 740;
  for (const l of lines) {
    const size = l.size ?? 11;
    const maxChars = Math.floor(95 * (11 / size));
    for (const part of wrap(l.text, maxChars)) {
      y -= l.gap ?? size + 6;
      const [r, g, b] = l.color ?? [0.067, 0.094, 0.153];
      ops.push(`BT /${l.bold ? "F2" : "F1"} ${size} Tf ${r} ${g} ${b} rg 50 ${y} Td (${ascii(part)}) Tj ET`);
      l.gap = undefined;
    }
  }
  const content = ops.join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
    `<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  objects.forEach((obj, i) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${i + 1} 0 obj\n${obj}\nendobj\n`;
  });
  const xref = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets.map((o) => `${String(o).padStart(10, "0")} 00000 n \n`).join("");
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(pdf);
}
