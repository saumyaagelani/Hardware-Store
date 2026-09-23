import { getDb } from "@/server/db";
import { getPricingViewer } from "@/server/auth/session";
import { categoryProductCounts, featuredProducts, getCategories, saleProducts } from "@/server/services/catalog";
import { Hero } from "@/components/home/hero";
import { ValueProps } from "@/components/home/value-props";
import { CategoryTiles } from "@/components/home/category-tiles";
import { PromoBanners } from "@/components/home/promo-banners";
import { ContractorBand } from "@/components/home/contractor-band";
import { QuoteSteps } from "@/components/home/quote-steps";
import { FulfilmentSection } from "@/components/home/fulfilment-section";
import { VisitUs } from "@/components/home/visit-us";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProductGrid } from "@/components/product/product-card";
import { env } from "@/config/env";
import { business, formattedAddress } from "@/config/business";

export default async function HomePage() {
  const viewer = await getPricingViewer();
  const db = getDb();
  const promos = db.banners.filter((b) => b.placement === "promo" && b.active).sort((a, b) => a.sortOrder - b.sortOrder);
  const featured = featuredProducts(viewer, 8);
  const onSale = saleProducts(viewer, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    name: business.name,
    url: env.siteUrl,
    telephone: business.phone,
    address: formattedAddress,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Hero content={db.content} />
      <ValueProps />

      <section className="container-page py-14 lg:py-20">
        <SectionHeading eyebrow="Shop by category" title="Everything for floors, doors & bath" href="/shop" linkLabel="Browse all products" />
        <CategoryTiles categories={getCategories()} counts={categoryProductCounts()} />
      </section>

      <section className="bg-canvas py-14 lg:py-20">
        <div className="container-page">
          <SectionHeading eyebrow="Customer favourites" title="Featured products" href="/shop?sort=featured" />
          <ProductGrid products={featured} priorityCount={4} />
        </div>
      </section>

      <section className="container-page py-14 lg:py-20">
        <PromoBanners banners={promos} />
      </section>

      {onSale.length ? (
        <section className="container-page pb-14 lg:pb-20">
          <SectionHeading eyebrow="Limited time" title="On sale now" description="Sale prices while stock lasts. Contractor accounts see their best available price." href="/deals" linkLabel="View all deals" />
          <ProductGrid products={onSale} />
        </section>
      ) : null}

      <ContractorBand pitch={db.content.contractorPitch} />
      <QuoteSteps pitch={db.content.quotePitch} />

      <section className="container-page py-14 lg:py-20">
        <SectionHeading eyebrow="Delivery & pickup" title="Get it how you need it" description="Choose free pickup or local delivery at checkout." />
        <FulfilmentSection settings={db.settings} />
      </section>

      <section className="container-page pb-16 lg:pb-24">
        <VisitUs />
      </section>
    </>
  );
}
