import { getDb } from "@/server/db";
import { business } from "@/config/business";
import { renderPdf, type PdfLine } from "@/server/art/pdf";

/** Placeholder technical documents generated from product data. */
export async function GET(_request: Request, ctx: RouteContext<"/media/docs/[slug]/[file]">) {
  const { slug, file } = await ctx.params;
  const product = getDb().products.find((p) => p.slug === slug);
  const doc = product?.documents.find((d) => `${d.id}.pdf` === file);
  if (!product || !doc) return new Response("Not found", { status: 404 });

  const lines: PdfLine[] = [
    { text: business.name.toUpperCase(), size: 16, bold: true, color: [1, 1, 1], gap: 0 },
    { text: doc.name, size: 11, color: [0.96, 0.72, 0.18], gap: 20 },
    { text: product.name, size: 18, bold: true, gap: 60 },
    { text: `SKU ${product.sku}  |  ${product.brand}`, size: 10, color: [0.42, 0.45, 0.5] },
    { text: "PROTOTYPE PLACEHOLDER DOCUMENT - replace with the manufacturer's official document before launch.", size: 9, bold: true, color: [0.72, 0.11, 0.11], gap: 24 },
    { text: "Overview", size: 13, bold: true, gap: 30 },
    { text: product.description, size: 10 },
    { text: doc.kind === "install_guide" ? "Installation" : doc.kind === "warranty" ? "Warranty" : "Specifications", size: 13, bold: true, gap: 30 },
    ...(doc.kind === "install_guide"
      ? [{ text: product.installation ?? "See manufacturer instructions.", size: 10 }]
      : doc.kind === "warranty"
        ? [{ text: product.warranty ?? "Warranty details to be confirmed.", size: 10 }]
        : product.specifications.map((s) => ({ text: `${s.label}: ${s.value}`, size: 10 }))),
    { text: "Features", size: 13, bold: true, gap: 30 },
    ...product.features.map((f) => ({ text: `- ${f}`, size: 10 })),
    { text: `${business.name} - ${business.phone} - ${business.email}`, size: 9, color: [0.42, 0.45, 0.5], gap: 40 },
  ];
  return new Response(new Uint8Array(renderPdf(lines)), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${product.slug}-${doc.id}.pdf"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
