import type { Metadata } from "next";
import { parseFilters } from "@/lib/catalog-filter";
import { CatalogPage } from "@/components/catalog/catalog-page";

export async function generateMetadata({ searchParams }: PageProps<"/search">): Promise<Metadata> {
  const { q } = parseFilters(await searchParams);
  return { title: q ? `Search: ${q}` : "Search", robots: { index: false, follow: true } };
}

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const filters = parseFilters(await searchParams);
  return (
    <CatalogPage
      filters={filters}
      title={filters.q ? `Results for “${filters.q}”` : "Search products"}
      breadcrumbs={[{ label: "Search" }]}
    />
  );
}
