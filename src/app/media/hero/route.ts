import { renderHeroSvg } from "@/server/art/draw";

export async function GET() {
  return new Response(renderHeroSvg(), {
    headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=86400", "X-Content-Type-Options": "nosniff" },
  });
}
