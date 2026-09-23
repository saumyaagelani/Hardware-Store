import type { Metadata } from "next";
import { BadgePercent } from "lucide-react";
import { parseFilters } from "@/lib/catalog-filter";
import { CatalogPage } from "@/components/catalog/catalog-page";

export const metadata: Metadata = {
  title: "Deals & Sale",
  description: "Current sale prices on vinyl flooring, doors, hardware, vanities and bathroom products.",
  alternates: { canonical: "/deals" },
};

export default async function DealsPage({ searchParams }: PageProps<"/deals">) {
  const filters = { ...parseFilters(await searchParams), onSale: true };
  return (
    <CatalogPage
      filters={filters}
      eyebrow="Limited-time savings"
      title="Deals & Sale"
      description="Sale prices are shown with the regular price struck through. Sale ends dates vary by product — while stock lasts."
      breadcrumbs={[{ label: "Deals & Sale" }]}
      banner={
        <div className="mb-8 flex items-center gap-4 rounded-lg bg-ink p-5 text-white sm:p-6">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-gold text-ink">
            <BadgePercent className="h-6 w-6" aria-hidden />
          </span>
          <div>
            <p className="font-display text-xl font-bold">Fall Flooring Event — save up to 20%</p>
            <p className="text-sm text-white/70">Contractor accounts automatically receive whichever is lower: the sale price or their contractor price.</p>
          </div>
        </div>
      }
    />
  );
}
