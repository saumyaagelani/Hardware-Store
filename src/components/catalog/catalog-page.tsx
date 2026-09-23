import Link from "next/link";
import { SearchX } from "lucide-react";
import type { CatalogFilters } from "@/lib/catalog-filter";
import { sortOptions } from "@/lib/catalog-filter";
import { getPricingViewer } from "@/server/auth/session";
import { getCategories, searchCatalog } from "@/server/services/catalog";
import { Breadcrumbs, type Crumb } from "@/components/ui/breadcrumbs";
import { EmptyState } from "@/components/ui/empty-state";
import { ButtonLink } from "@/components/ui/button";
import { ProductGrid } from "@/components/product/product-card";
import { formatMoney, pluralize } from "@/lib/format";
import { ActiveFilters, FilterSidebar, MobileFilters, SortSelect, type ActiveChip } from "./filter-panel";
import { cn } from "@/lib/cn";

interface CatalogPageProps {
  filters: CatalogFilters;
  title: string;
  description?: string;
  eyebrow?: string;
  breadcrumbs: Crumb[];
  showCategoryFilter?: boolean;
  subcategoryLinks?: { slug: string; name: string; href: string; active: boolean }[];
  banner?: React.ReactNode;
}

export async function CatalogPage({ filters, title, description, eyebrow, breadcrumbs, showCategoryFilter = true, subcategoryLinks, banner }: CatalogPageProps) {
  const viewer = await getPricingViewer();
  const { products, facets, total } = searchCatalog(filters, viewer);
  const categories = getCategories();

  const chips: ActiveChip[] = [];
  if (showCategoryFilter && filters.category) chips.push({ key: "category", label: categories.find((c) => c.slug === filters.category)?.name ?? filters.category });
  if (filters.sub && !subcategoryLinks) chips.push({ key: "sub", label: facets.subcategories.find((s) => s.value === filters.sub)?.label ?? filters.sub });
  for (const a of filters.availability ?? []) chips.push({ key: "availability", value: a, label: a === "in_stock" ? "In stock" : "Special order" });
  if (filters.onSale) chips.push({ key: "sale", label: "On sale" });
  for (const b of filters.brands ?? []) chips.push({ key: "brand", value: b, label: b });
  if (filters.priceMin !== undefined) chips.push({ key: "min", label: `From ${formatMoney(filters.priceMin)}` });
  if (filters.priceMax !== undefined) chips.push({ key: "max", label: `Up to ${formatMoney(filters.priceMax)}` });

  return (
    <div className="container-page py-6 lg:py-8">
      <Breadcrumbs items={breadcrumbs} />
      <div className="mt-5 mb-6 border-b border-line pb-6">
        {eyebrow ? <p className="eyebrow mb-2">{eyebrow}</p> : null}
        <h1 className="text-3xl font-extrabold text-ink sm:text-4xl">{title}</h1>
        {description ? <p className="mt-2 max-w-3xl text-[0.9375rem] leading-relaxed text-body">{description}</p> : null}
        {subcategoryLinks?.length ? (
          <nav aria-label="Product types" className="scrollbar-none -mx-4 mt-5 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
            {subcategoryLinks.map((s) => (
              <Link
                key={s.slug}
                href={s.href}
                aria-current={s.active ? "page" : undefined}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
                  s.active ? "border-ink bg-ink text-white" : "border-line bg-white text-ink hover:border-ink",
                )}
              >
                {s.name}
              </Link>
            ))}
          </nav>
        ) : null}
      </div>

      {banner}

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <FilterSidebar facets={facets} showCategories={showCategoryFilter} />
        <div className="min-w-0">
          <div className="mb-5 flex items-center justify-between gap-3">
            <p className="text-sm text-body" aria-live="polite">
              <span className="font-semibold text-ink">{pluralize(total, "product")}</span>
              {filters.q ? (
                <>
                  {" "}for “<span className="font-semibold text-ink">{filters.q}</span>”
                </>
              ) : null}
            </p>
            <div className="flex items-center gap-2">
              <MobileFilters facets={facets} showCategories={showCategoryFilter} total={total} />
              <SortSelect options={sortOptions} />
            </div>
          </div>
          <ActiveFilters chips={chips} />
          {products.length ? (
            <ProductGrid products={products} className="lg:grid-cols-3" priorityCount={3} />
          ) : (
            <EmptyState
              icon={SearchX}
              title={filters.q ? `No results for “${filters.q}”` : "No products match these filters"}
              description={
                filters.q
                  ? "Check the spelling, try a more general term like “vinyl”, “door” or “vanity”, or ask our team — we can special-order many products."
                  : "Try removing a filter or browsing another category."
              }
            >
              <ButtonLink href="/shop" variant="dark">
                Browse all products
              </ButtonLink>
              <ButtonLink href={`/quote${filters.q ? `?products=${encodeURIComponent(filters.q)}` : ""}`} variant="outline">
                Ask for a quote
              </ButtonLink>
            </EmptyState>
          )}
        </div>
      </div>
    </div>
  );
}
