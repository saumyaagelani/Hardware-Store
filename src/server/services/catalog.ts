import "server-only";
import type { Category, Product } from "@/lib/types";
import { getDb } from "@/server/db";
import { toCardView, toProductView, type ProductCardView, type ProductView } from "@/lib/catalog-view";
import { filterProducts, type CatalogFilters } from "@/lib/catalog-filter";
import { isActiveSale, type PricingViewer } from "@/lib/pricing";

export function getCategories(): Category[] {
  return [...getDb().categories].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return getDb().categories.find((c) => c.slug === slug);
}

export function getProductBySlug(slug: string): Product | undefined {
  return getDb().products.find((p) => p.slug === slug && p.active);
}

export function viewProduct(product: Product, viewer: PricingViewer | null): ProductView {
  return toProductView(product, getDb().categories, viewer);
}

export function cardViews(products: Product[], viewer: PricingViewer | null): ProductCardView[] {
  const categories = getDb().categories;
  return products.map((p) => toCardView(toProductView(p, categories, viewer)));
}

export function searchCatalog(filters: CatalogFilters, viewer: PricingViewer | null) {
  const db = getDb();
  const { products, facets } = filterProducts(db.products, db.categories, filters, viewer);
  return { products: cardViews(products, viewer), facets, total: products.length };
}

export function productsByIds(ids: string[], viewer: PricingViewer | null): ProductCardView[] {
  const byId = new Map(getDb().products.map((p) => [p.id, p]));
  const found = ids.map((id) => byId.get(id)).filter((p): p is Product => Boolean(p && p.active));
  return cardViews(found, viewer);
}

export function featuredProducts(viewer: PricingViewer | null, limit = 8): ProductCardView[] {
  return cardViews(
    getDb().products.filter((p) => p.active && p.featured).slice(0, limit),
    viewer,
  );
}

export function saleProducts(viewer: PricingViewer | null, limit = 8): ProductCardView[] {
  return cardViews(
    getDb().products.filter((p) => p.active && isActiveSale(p.pricing) && p.pricing.visibility === "public").slice(0, limit),
    viewer,
  );
}

/** Related products fall back to same-category items when none are curated. */
export function relatedFor(product: Product, viewer: PricingViewer | null, limit = 4): ProductCardView[] {
  const curated = productsByIds(product.relatedIds, viewer);
  if (curated.length >= limit) return curated.slice(0, limit);
  const extra = getDb()
    .products.filter(
      (p) => p.active && p.categoryId === product.categoryId && p.id !== product.id && !product.relatedIds.includes(p.id),
    )
    .slice(0, limit - curated.length);
  return [...curated, ...cardViews(extra, viewer)];
}

export function categoryProductCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const p of getDb().products) if (p.active) counts[p.categoryId] = (counts[p.categoryId] ?? 0) + 1;
  return counts;
}
