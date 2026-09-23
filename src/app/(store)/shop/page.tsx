import type { Metadata } from "next";
import { parseFilters } from "@/lib/catalog-filter";
import { CatalogPage } from "@/components/catalog/catalog-page";

export const metadata: Metadata = {
  title: "Shop All Products",
  description: "Browse vinyl flooring, stairs, doors, locks, shower bases and doors, vanities, plumbing and WPC wall panels.",
  alternates: { canonical: "/shop" },
};

export default async function ShopPage({ searchParams }: PageProps<"/shop">) {
  const filters = parseFilters(await searchParams);
  return (
    <CatalogPage
      filters={filters}
      title="All Products"
      description="Flooring, doors, bath and plumbing supplies for homeowners and the trade. Filter by category, availability, brand or price."
      breadcrumbs={[{ label: "Shop" }]}
    />
  );
}
