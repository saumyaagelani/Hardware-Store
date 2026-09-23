import { getDb } from "@/server/db";
import { renderProductSvg, type View } from "@/server/art/draw";
import { supportsRoomView } from "@/lib/art";

export async function GET(request: Request, ctx: RouteContext<"/media/products/[slug]/[file]">) {
  const { slug, file } = await ctx.params;
  const match = /^([123])\.svg$/.exec(file);
  const product = getDb().products.find((p) => p.slug === slug);
  if (!match || !product?.art) return new Response("Not found", { status: 404 });
  if (match[1] === "3" && !supportsRoomView(product.art.kind, product.art.variant)) return new Response("Not found", { status: 404 });

  // Optional colour override (?c=RRGGBB) so variant swatches can recolour the artwork.
  const colour = new URL(request.url).searchParams.get("c");
  const primary = colour && /^[0-9a-f]{6}$/i.test(colour) ? `#${colour}` : product.art.primary;

  const svg = renderProductSvg({ ...product.art, primary, seed: product.slug }, Number(match[1]) as View);
  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
