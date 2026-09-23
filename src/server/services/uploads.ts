import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { UploadedFile } from "@/lib/types";
import { DATA_DIR, mutate, newId, getDb } from "@/server/db";
import { UPLOAD_RULES } from "@/lib/uploads";

/**
 * PROTOTYPE FILE STORAGE
 * -----------------------------------------------------------------------------
 * Files are validated (extension, declared type AND file signature) and stored
 * outside the public directory under DATA_DIR/uploads with random names. They
 * are only served back through an authorised route with a safe content type.
 * Production should move this to object storage (S3 / R2 / Azure Blob) with
 * virus scanning — see PRODUCTION_TODO.md.
 */
const UPLOAD_DIR = path.join(DATA_DIR, "uploads");

const signatures: { mime: string; test: (b: Buffer) => boolean }[] = [
  { mime: "image/jpeg", test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { mime: "image/png", test: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  { mime: "image/webp", test: (b) => b.subarray(0, 4).toString() === "RIFF" && b.subarray(8, 12).toString() === "WEBP" },
  { mime: "image/heic", test: (b) => b.subarray(4, 8).toString() === "ftyp" && /^(heic|heix|mif1|msf1)$/.test(b.subarray(8, 12).toString()) },
  { mime: "application/pdf", test: (b) => b.subarray(0, 5).toString() === "%PDF-" },
];

export type UploadResult = { ok: true; file: UploadedFile } | { ok: false; error: string };

export async function storeUpload(file: File, owner: { userId?: string }): Promise<UploadResult> {
  const ext = path.extname(file.name).toLowerCase();
  if (!UPLOAD_RULES.extensions.includes(ext)) {
    return { ok: false, error: `“${file.name}” isn't a supported file type. Upload JPG, PNG, WEBP, HEIC or PDF files.` };
  }
  if (file.size === 0) return { ok: false, error: `“${file.name}” is empty.` };
  if (file.size > UPLOAD_RULES.maxBytes) {
    return { ok: false, error: `“${file.name}” is larger than ${UPLOAD_RULES.maxBytes / 1024 / 1024} MB.` };
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const detected = signatures.find((s) => s.test(buffer));
  if (!detected) {
    return { ok: false, error: `“${file.name}” doesn't look like a valid image or PDF.` };
  }

  const id = newId("upl");
  const storedName = `${id}${ext}`;
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  fs.writeFileSync(path.join(UPLOAD_DIR, storedName), buffer);

  const record: UploadedFile = {
    id,
    originalName: path.basename(file.name).replace(/[^\w.\- ()]/g, "_").slice(0, 120),
    mimeType: detected.mime,
    sizeBytes: file.size,
    uploadedAt: new Date().toISOString(),
    userId: owner.userId,
  };
  mutate((db) => {
    db.uploads.push(record);
  });
  return { ok: true, file: record };
}

export function readUpload(id: string): { file: UploadedFile; data: Buffer | null } | null {
  const file = getDb().uploads.find((u) => u.id === id);
  if (!file) return null;
  if (file.demo) return { file, data: null };
  const ext = path.extname(file.originalName).toLowerCase();
  const full = path.join(UPLOAD_DIR, `${file.id}${ext}`);
  if (!full.startsWith(UPLOAD_DIR) || !fs.existsSync(full)) return { file, data: null };
  return { file, data: fs.readFileSync(full) };
}
