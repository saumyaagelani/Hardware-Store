import { getCurrentUser, hasPermission } from "@/server/auth/session";
import { readUpload } from "@/server/services/uploads";
import { renderPdf } from "@/server/art/pdf";

/** Serve an uploaded file to its owner or to staff with quote access. */
export async function GET(_request: Request, ctx: RouteContext<"/api/uploads/[id]">) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  const found = readUpload(id);
  if (!found || !user) return new Response("Not found", { status: 404 });
  const allowed = hasPermission(user, "quotes") || (found.file.userId && found.file.userId === user.id);
  if (!allowed) return new Response("Not found", { status: 404 });

  const headers = {
    "Content-Disposition": `attachment; filename="${found.file.originalName.replace(/"/g, "")}"`,
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "private, no-store",
    "Content-Security-Policy": "default-src 'none'; sandbox",
  };
  if (!found.data) {
    // Seeded demo files have no stored bytes — return a labelled placeholder PDF.
    const pdf = renderPdf([
      { text: "DEMO FILE", size: 16, bold: true, color: [1, 1, 1], gap: 0 },
      { text: found.file.originalName, size: 18, bold: true, gap: 90 },
      { text: "This is placeholder content for a seeded demo upload. Real uploads are stored and returned unchanged.", size: 11 },
    ]);
    return new Response(new Uint8Array(pdf), { headers: { ...headers, "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="demo-${found.file.id}.pdf"` } });
  }
  return new Response(new Uint8Array(found.data), { headers: { ...headers, "Content-Type": found.file.mimeType } });
}
