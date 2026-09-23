/** Shared (client + server) upload rules. */
export const UPLOAD_RULES = {
  extensions: [".jpg", ".jpeg", ".png", ".webp", ".heic", ".pdf"],
  accept: "image/jpeg,image/png,image/webp,image/heic,application/pdf,.heic",
  maxBytes: 10 * 1024 * 1024,
  maxFiles: 8,
  description: "JPG, PNG, WEBP, HEIC or PDF · up to 10 MB each · max 8 files",
};

export function validateUploadClient(file: { name: string; size: number }): string | null {
  const dot = file.name.lastIndexOf(".");
  const ext = dot >= 0 ? file.name.slice(dot).toLowerCase() : "";
  if (!UPLOAD_RULES.extensions.includes(ext)) return `“${file.name}” isn't a supported file type.`;
  if (file.size > UPLOAD_RULES.maxBytes) return `“${file.name}” is larger than 10 MB.`;
  if (file.size === 0) return `“${file.name}” is empty.`;
  return null;
}
