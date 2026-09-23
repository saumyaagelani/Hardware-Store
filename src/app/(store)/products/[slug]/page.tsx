import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Download, FileText } from "lucide-react";
import { getCurrentUser, pricingViewerFor } from "@/server/auth/session";
import { getDb } from "@/server/db";
import { getProductBySlug, productsByIds, relatedFor, viewProduct } from "@/server/services/catalog";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/ui/breadcrumbs";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProductGrid } from "@/components/product/product-card";
import { ProductDetail, type ViewerState } from "@/components/product/product-detail";
import { ProductTabs } from "@/components/product/product-tabs";
import { env } from "@/config/env";
import { formatMoney } from "@/lib/format";

export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: product.shortDescription,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: { title: product.name, description: product.shortDescription, images: product.images.slice(0, 1).map((i) => i.src) },
  };
}

export default async function ProductPage({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const user = await getCurrentUser();
  const viewer = pricingViewerFor(user);
  const view = viewProduct(product, viewer);
  const settings = getDb().settings;
  const viewerState: ViewerState = !user
    ? "guest"
    : user.role !== "customer"
      ? "staff"
      : user.accountType === "contractor"
        ? (user.contractorStatus ?? "pending")
        : "regular";
  const accessories = productsByIds(product.accessoryIds, viewer);
  const related = relatedFor(product, viewer, 4);
  const minDelivery = Math.min(...settings.deliveryZones.filter((z) => z.active).map((z) => z.fee));
  const crumbs = [
    { label: "Shop", href: "/shop" },
    { label: view.category.name, href: `/shop/${view.category.slug}` },
    { label: product.name },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    brand: { "@type": "Brand", name: product.brand },
    description: product.description,
    image: product.images.map((i) => new URL(i.src, env.siteUrl).toString()),
    // Only publicly visible prices are exposed to crawlers.
    offers:
      view.price.mode === "price" && view.price.kind !== "contractor"
        ? {
            "@type": "Offer",
            priceCurrency: "CAD",
            price: view.price.amount.toFixed(2),
            availability: view.stock.purchasable ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          }
        : undefined,
  };

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      content: (
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="prose-store">
            <p>{product.description}</p>
          </div>
          <div>
            <h3 className="mb-3 font-display text-lg font-bold text-ink">Key features</h3>
            <ul className="space-y-2">
              {product.features.map((f) => (
                <li key={f} className="flex gap-2.5 text-sm text-ink">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-dark" aria-hidden /> {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: "specs",
      label: "Specifications",
      content: (
        <dl className="grid max-w-3xl overflow-hidden rounded-lg border border-line sm:grid-cols-2">
          {[
            ["SKU", product.sku],
            ["Brand", product.brand],
            ...(product.attributes.colour ? [["Colour", product.attributes.colour]] : []),
            ...(product.attributes.finish ? [["Finish", product.attributes.finish]] : []),
            ...(product.attributes.material ? [["Material", product.attributes.material]] : []),
            ...(product.attributes.dimensions ? [["Dimensions", product.attributes.dimensions]] : []),
            ...(product.attributes.thickness ? [["Thickness", product.attributes.thickness]] : []),
            ...product.specifications.map((s) => [s.label, s.value]),
            ...(product.minOrderQty ? [["Minimum order", String(product.minOrderQty)]] : []),
          ].map(([label, value], i) => (
            <div key={`${label}-${i}`} className="flex justify-between gap-4 border-b border-line px-4 py-3 text-sm odd:bg-canvas sm:[&:nth-last-child(-n+2)]:border-b-0">
              <dt className="text-body">{label}</dt>
              <dd className="text-right font-medium text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      ),
    },
    ...(product.installation
      ? [{ id: "install", label: "Installation", content: <div className="prose-store max-w-3xl"><p>{product.installation}</p><p className="text-xs!">Always follow the manufacturer&apos;s installation instructions and local building codes.</p></div> }]
      : []),
    ...(product.warranty ? [{ id: "warranty", label: "Warranty", content: <div className="prose-store max-w-3xl"><p>{product.warranty}</p></div> }] : []),
    {
      id: "documents",
      label: `Documents (${product.documents.length})`,
      content: product.documents.length ? (
        <ul className="grid max-w-3xl gap-3 sm:grid-cols-2">
          {product.documents.map((d) => (
            <li key={d.id}>
              <a href={d.url} target="_blank" rel="noopener" className="flex items-center gap-3 rounded-lg border border-line p-4 hover:border-ink">
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-danger-soft text-danger">
                  <FileText className="h-5 w-5" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-ink">{d.name}</span>
                  <span className="text-xs text-body">PDF · {d.sizeKb} KB</span>
                </span>
                <Download className="h-4.5 w-4.5 text-body" aria-hidden />
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-body">Technical documents for this product are available on request — contact our team.</p>
      ),
    },
  ];

  return (
    <div className="container-page py-6 lg:py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([jsonLd, breadcrumbJsonLd(crumbs, env.siteUrl)]) }} />
      <Breadcrumbs items={crumbs} />
      <div className="mt-6">
        <ProductDetail
          product={view}
          viewerState={viewerState}
          pickupReady={settings.pickupLocations[0]?.readyTime ?? "within 2 business hours"}
          deliveryFrom={formatMoney(minDelivery)}
        />
      </div>

      <section className="mt-14 border-t border-line pt-4" aria-label="Product details">
        <ProductTabs tabs={tabs} />
      </section>

      {accessories.length ? (
        <section className="mt-12">
          <SectionHeading eyebrow="Complete the job" title="Accessories & compatible items" />
          <ProductGrid products={accessories.slice(0, 4)} />
        </section>
      ) : null}

      {related.length ? (
        <section className="mt-14 mb-6">
          <SectionHeading eyebrow="You may also like" title="Related products" href={`/shop/${view.category.slug}`} linkLabel={`More ${view.category.name}`} />
          <ProductGrid products={related} />
        </section>
      ) : null}
    </div>
  );
}
