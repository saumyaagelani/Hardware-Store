import type { Category, Product, StockStatus } from "./types";
import { isActiveSale, resolvePrice, type PricingViewer } from "./pricing";

export type SortOption = "featured" | "price-asc" | "price-desc" | "name" | "newest";

export const sortOptions: { value: SortOption; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest" },
  { value: "name", label: "Name A–Z" },
];

export interface CatalogFilters {
  q?: string;
  category?: string;
  sub?: string;
  brands?: string[];
  availability?: ("in_stock" | "special_order")[];
  onSale?: boolean;
  priceMin?: number;
  priceMax?: number;
  sort?: SortOption;
}

export interface Facets {
  brands: { value: string; count: number }[];
  subcategories: { value: string; label: string; count: number }[];
  categories: { value: string; label: string; count: number }[];
  inStock: number;
  specialOrder: number;
  onSale: number;
}

const normalise = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/["'”]/g, "");

/** Simple synonym expansion so common trade terms find the right products. */
const synonyms: Record<string, string[]> = {
  lvp: ["vinyl", "plank"],
  spc: ["rigid", "vinyl"],
  floor: ["vinyl", "plank", "flooring"],
  flooring: ["vinyl", "plank"],
  toilet: ["toilet"],
  sink: ["vanity"],
  tap: ["faucet", "valve"],
  handle: ["lever", "pull", "handleset"],
  knob: ["lever"],
  lock: ["lock", "deadbolt", "lever"],
  shower: ["shower"],
  panel: ["panel", "wpc"],
  wall: ["panel", "wpc"],
  pipe: ["pex"],
};

/** Score how well a product matches a free-text query (0 = no match). */
export function searchScore(product: Product, category: Category | undefined, query: string): number {
  const terms = normalise(query).split(/\s+/).filter((t) => t.length > 1);
  if (!terms.length) return 1;
  const name = normalise(product.name);
  const haystack = normalise(
    [
      product.name,
      product.brand,
      product.sku,
      category?.name ?? "",
      product.subcategory ?? "",
      product.shortDescription,
      product.description,
      product.attributes.colour ?? "",
      product.attributes.material ?? "",
      product.attributes.finish ?? "",
      ...product.variants.flatMap((v) => v.options.map((o) => o.label)),
    ].join(" "),
  );

  let score = 0;
  for (const term of terms) {
    const stem = term.endsWith("s") && term.length > 3 ? term.slice(0, -1) : term;
    const alternatives = [stem, ...(synonyms[stem] ?? [])];
    let best = 0;
    for (const alt of alternatives) {
      if (normalise(product.sku) === alt) best = Math.max(best, 10);
      if (name.includes(alt)) best = Math.max(best, alt === stem ? 5 : 3);
      else if (haystack.includes(alt)) best = Math.max(best, alt === stem ? 2 : 1);
    }
    if (best === 0) return 0; // every term must match something
    score += best;
  }
  return score;
}

function effectivePrice(product: Product, viewer: PricingViewer | null): number | null {
  const view = resolvePrice(product.pricing, viewer);
  return view.mode === "price" ? view.amount : null;
}

const inStockStatuses: StockStatus[] = ["in_stock", "low_stock"];

export function filterProducts(
  products: Product[],
  categories: Category[],
  filters: CatalogFilters,
  viewer: PricingViewer | null,
): { products: Product[]; facets: Facets } {
  const catById = new Map(categories.map((c) => [c.id, c]));
  const active = products.filter((p) => p.active);

  // 1. Query + category scope define the base set used for facet counts.
  const scored = active
    .map((p) => ({ p, score: filters.q ? searchScore(p, catById.get(p.categoryId), filters.q) : 1 }))
    .filter(({ score }) => score > 0);
  const scoped = scored.filter(({ p }) => !filters.category || catById.get(p.categoryId)?.slug === filters.category);

  // 2. Refinements.
  const refined = scoped.filter(({ p }) => {
    if (filters.sub && p.subcategory !== filters.sub) return false;
    if (filters.brands?.length && !filters.brands.includes(p.brand)) return false;
    if (filters.onSale && !(isActiveSale(p.pricing) && effectivePrice(p, viewer) !== null)) return false;
    if (filters.availability?.length) {
      const wantsStock = filters.availability.includes("in_stock") && inStockStatuses.includes(p.inventory.status);
      const wantsSpecial = filters.availability.includes("special_order") && p.inventory.status === "special_order";
      if (!wantsStock && !wantsSpecial) return false;
    }
    if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
      const price = effectivePrice(p, viewer);
      if (price === null) return false;
      if (filters.priceMin !== undefined && price < filters.priceMin) return false;
      if (filters.priceMax !== undefined && price > filters.priceMax) return false;
    }
    return true;
  });

  // 3. Sort.
  const sort = filters.sort ?? (filters.q ? undefined : "featured");
  const sorted = [...refined].sort((a, b) => {
    switch (sort) {
      case "price-asc":
      case "price-desc": {
        const pa = effectivePrice(a.p, viewer);
        const pb = effectivePrice(b.p, viewer);
        if (pa === null && pb === null) return 0;
        if (pa === null) return 1; // quote-only items last
        if (pb === null) return -1;
        return sort === "price-asc" ? pa - pb : pb - pa;
      }
      case "name":
        return a.p.name.localeCompare(b.p.name);
      case "newest":
        return b.p.createdAt.localeCompare(a.p.createdAt);
      case "featured":
        return Number(b.p.featured) - Number(a.p.featured) || (catById.get(a.p.categoryId)?.sortOrder ?? 0) - (catById.get(b.p.categoryId)?.sortOrder ?? 0);
      default:
        return b.score - a.score;
    }
  });

  // 4. Facets (counted within the query/category scope).
  const scopedProducts = scoped.map(({ p }) => p);
  const brandCounts = new Map<string, number>();
  const subCounts = new Map<string, number>();
  const catCounts = new Map<string, number>();
  for (const { p } of scored) catCounts.set(p.categoryId, (catCounts.get(p.categoryId) ?? 0) + 1);
  for (const p of scopedProducts) {
    brandCounts.set(p.brand, (brandCounts.get(p.brand) ?? 0) + 1);
    if (p.subcategory) subCounts.set(p.subcategory, (subCounts.get(p.subcategory) ?? 0) + 1);
  }
  const scopedCategory = filters.category ? categories.find((c) => c.slug === filters.category) : undefined;

  return {
    products: sorted.map(({ p }) => p),
    facets: {
      brands: [...brandCounts].map(([value, count]) => ({ value, count })).sort((a, b) => a.value.localeCompare(b.value)),
      subcategories: (scopedCategory?.subcategories ?? [])
        .map((s) => ({ value: s.slug, label: s.name, count: subCounts.get(s.slug) ?? 0 }))
        .filter((s) => s.count > 0),
      categories: [...categories]
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((c) => ({ value: c.slug, label: c.name, count: catCounts.get(c.id) ?? 0 }))
        .filter((c) => c.count > 0),
      inStock: scopedProducts.filter((p) => inStockStatuses.includes(p.inventory.status)).length,
      specialOrder: scopedProducts.filter((p) => p.inventory.status === "special_order").length,
      onSale: scopedProducts.filter((p) => isActiveSale(p.pricing) && effectivePrice(p, viewer) !== null).length,
    },
  };
}

/** Parse Next.js searchParams into typed filters. */
export function parseFilters(params: Record<string, string | string[] | undefined>): CatalogFilters {
  const one = (k: string) => {
    const v = params[k];
    return Array.isArray(v) ? v[0] : v;
  };
  const many = (k: string) => {
    const v = params[k];
    return (Array.isArray(v) ? v : v ? [v] : []).flatMap((x) => x.split(",")).filter(Boolean);
  };
  const num = (k: string) => {
    const v = one(k);
    if (!v) return undefined;
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 ? n : undefined;
  };
  const sortValue = one("sort");
  return {
    q: one("q")?.slice(0, 100) || undefined,
    category: one("category") || undefined,
    sub: one("sub") || undefined,
    brands: many("brand"),
    availability: many("availability").filter((a): a is "in_stock" | "special_order" => a === "in_stock" || a === "special_order"),
    onSale: one("sale") === "1",
    priceMin: num("min"),
    priceMax: num("max"),
    sort: sortOptions.some((o) => o.value === sortValue) ? (sortValue as SortOption) : undefined,
  };
}
