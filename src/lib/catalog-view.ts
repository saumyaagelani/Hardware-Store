import type {
  Category,
  CoverageInfo,
  PriceView,
  Product,
  ProductBadge,
  ProductDocument,
  ProductImage,
  ProductSpec,
  VariantGroup,
} from "./types";
import { isActiveSale, resolvePrice, type PricingViewer } from "./pricing";
import { describeStock, type StockDisplay } from "./stock";

/**
 * The browser-safe representation of a product. It deliberately omits the raw
 * pricing object — only the price this particular viewer is entitled to see is
 * included, so contractor prices never reach guests or unapproved accounts.
 */
export interface ProductView {
  id: string;
  slug: string;
  name: string;
  category: { slug: string; name: string };
  subcategory?: { slug: string; name: string };
  sku: string;
  brand: string;
  shortDescription: string;
  description: string;
  features: string[];
  price: PriceView;
  onSale: boolean;
  stock: StockDisplay;
  restockDate?: string;
  coverage?: CoverageInfo;
  attributes: Product["attributes"];
  specifications: ProductSpec[];
  installation?: string;
  warranty?: string;
  images: ProductImage[];
  documents: ProductDocument[];
  variants: VariantGroup[];
  relatedIds: string[];
  accessoryIds: string[];
  minOrderQty?: number;
  oversized?: boolean;
  badges: ProductBadge[];
  featured: boolean;
}

export type ProductCardView = Pick<
  ProductView,
  "id" | "slug" | "name" | "brand" | "sku" | "category" | "price" | "onSale" | "stock" | "images" | "badges" | "variants" | "minOrderQty"
>;

export function toProductView(product: Product, categories: Category[], viewer: PricingViewer | null): ProductView {
  const category = categories.find((c) => c.id === product.categoryId);
  const sub = category?.subcategories.find((s) => s.slug === product.subcategory);
  const price = resolvePrice(product.pricing, viewer);
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: { slug: category?.slug ?? product.categoryId, name: category?.name ?? "Products" },
    subcategory: sub ? { slug: sub.slug, name: sub.name } : undefined,
    sku: product.sku,
    brand: product.brand,
    shortDescription: product.shortDescription,
    description: product.description,
    features: product.features,
    price,
    onSale: price.mode === "price" && price.kind === "sale" && isActiveSale(product.pricing),
    stock: describeStock(product.inventory),
    restockDate: product.inventory.restockDate,
    coverage: product.coverage,
    attributes: product.attributes,
    specifications: product.specifications,
    installation: product.installation,
    warranty: product.warranty,
    images: product.images,
    documents: product.documents,
    variants: product.variants,
    relatedIds: product.relatedIds,
    accessoryIds: product.accessoryIds,
    minOrderQty: product.minOrderQty,
    oversized: product.oversized,
    badges: product.badges,
    featured: product.featured,
  };
}

export function toCardView(view: ProductView): ProductCardView {
  const { id, slug, name, brand, sku, category, price, onSale, stock, images, badges, variants, minOrderQty } = view;
  return { id, slug, name, brand, sku, category, price, onSale, stock, images: images.slice(0, 2), badges, variants, minOrderQty };
}
