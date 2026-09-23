import type { ArtKind } from "@/lib/types";
import { renderProductSvg } from "@/server/art/draw";

const categoryArt: Record<string, { kind: ArtKind; primary: string; secondary?: string; variant: number; view: 1 | 3 }> = {
  vinyl: { kind: "vinyl", primary: "#c9a27a", secondary: "#a57f58", variant: 0, view: 3 },
  stairs: { kind: "stairs", primary: "#c9a27a", secondary: "#8b6a48", variant: 0, view: 1 },
  doors: { kind: "door", primary: "#f4f3ef", secondary: "#d9d6cd", variant: 1, view: 3 },
  locks: { kind: "lock", primary: "#1f2328", variant: 0, view: 1 },
  "shower-bases": { kind: "shower-base", primary: "#f7f8fa", secondary: "#c9ced6", variant: 0, view: 1 },
  "shower-doors": { kind: "shower-door", primary: "#1f2328", variant: 0, view: 1 },
  "shower-accessories": { kind: "shower-accessory", primary: "#1f2328", variant: 0, view: 1 },
  "toilet-seats": { kind: "toilet-seat", primary: "#fbfbfb", secondary: "#d7dbe0", variant: 0, view: 1 },
  vanities: { kind: "vanity", primary: "#23385a", secondary: "#f2f2ef", variant: 0, view: 3 },
  plumbing: { kind: "plumbing", primary: "#c8372d", secondary: "#1d4ed8", variant: 0, view: 1 },
  "wpc-wall-panels": { kind: "wpc-panel", primary: "#c49a6c", secondary: "#8a6440", variant: 0, view: 1 },
};

export async function GET(_request: Request, ctx: RouteContext<"/media/categories/[file]">) {
  const { file } = await ctx.params;
  const slug = file.replace(/\.svg$/, "");
  const art = categoryArt[slug];
  if (!art || !file.endsWith(".svg")) return new Response("Not found", { status: 404 });
  const svg = renderProductSvg({ ...art, seed: `category-${slug}` }, art.view);
  return new Response(svg, {
    headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=86400", "X-Content-Type-Options": "nosniff" },
  });
}
