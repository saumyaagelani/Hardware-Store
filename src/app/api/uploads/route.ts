import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth/session";
import { storeUpload } from "@/server/services/uploads";
import { UPLOAD_RULES } from "@/lib/uploads";

/** Accepts a single file per request (multipart field "file"). */
export async function POST(request: Request) {
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > UPLOAD_RULES.maxBytes + 64 * 1024) {
    return NextResponse.json({ error: "File is larger than 10 MB." }, { status: 413 });
  }
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
  }
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file received." }, { status: 400 });

  const user = await getCurrentUser();
  const result = await storeUpload(file, { userId: user?.id });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 422 });
  const { id, originalName, mimeType, sizeBytes } = result.file;
  return NextResponse.json({ id, originalName, mimeType, sizeBytes });
}
