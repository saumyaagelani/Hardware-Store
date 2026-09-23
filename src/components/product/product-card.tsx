import Link from "next/link";
import type { ProductCardView } from "@/lib/catalog-view";
import { ProductFlag } from "@/components/ui/badge";
import { PriceDisplay } from "./price";
import { StockIndicator } from "./stock-indicator";
import { CardActions } from "./card-actions";
import { cn } from "@/lib/cn";

const badgeLabels = { new: "New", best_seller: "Best Seller", clearance: "Clearance", eco: "Eco", exclusive: "Exclusive" } as const;

export function ProductCard({ product, priority = false, className }: { product: ProductCardView; priority?: boolean; className?: string }) {
  const [primary, secondary] = product.images;
  const savings = product.price.mode === "price" && product.price.kind === "sale" ? product.price.savingsPercent : undefined;
  return (
    <article className={cn("group relative flex h-full flex-col overflow-hidden rounded-lg border border-line bg-white transition-shadow hover:shadow-raised", className)}>
      <Link href={`/products/${product.slug}`} className="relative block aspect-square overflow-hidden bg-mist" tabIndex={-1} aria-hidden>
        {primary ? (
          <img src={primary.src} alt="" loading={priority ? "eager" : "lazy"} className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-0" />
        ) : null}
        {secondary ? <img src={secondary.src} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100" /> : null}
        <span className="absolute top-3 left-3 flex flex-col items-start gap-1.5">
          {savings ? <ProductFlag variant="gold">Sale −{savings}%</ProductFlag> : null}
          {product.badges.slice(0, savings ? 1 : 2).map((b) => (
            <ProductFlag key={b} variant={b === "new" ? "dark" : "light"}>
              {badgeLabels[b]}
            </ProductFlag>
          ))}
        </span>
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-[0.6875rem] font-semibold tracking-[0.08em] text-body uppercase">{product.brand}</p>
        <h3 className="mt-1 text-[0.9375rem] leading-snug font-semibold text-ink">
          <Link href={`/products/${product.slug}`} className="line-clamp-2 min-h-[2.6em] hover:underline">
            {product.name}
          </Link>
        </h3>
        <div className="mt-3">
          <PriceDisplay price={product.price} size="sm" />
        </div>
        <StockIndicator stock={product.stock} className="mt-2" />
        <div className="mt-auto pt-4">
          <CardActions product={product} />
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({ products, className, priorityCount = 0 }: { products: ProductCardView[]; className?: string; priorityCount?: number }) {
  return (
    <ul className={cn("grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4", className)}>
      {products.map((p, i) => (
        <li key={p.id}>
          <ProductCard product={p} priority={i < priorityCount} />
        </li>
      ))}
    </ul>
  );
}
