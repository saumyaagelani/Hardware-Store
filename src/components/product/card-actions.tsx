"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import type { ProductCardView } from "@/lib/catalog-view";
import { buttonClass } from "@/components/ui/button";
import { useAddToCart } from "./use-add-to-cart";

export function CardActions({ product }: { product: ProductCardView }) {
  const add = useAddToCart();
  if (product.price.mode === "quote") {
    return (
      <Link href={`/quote?product=${product.slug}`} className={buttonClass("outline", "sm", "w-full")}>
        Request a Quote
      </Link>
    );
  }
  if (!product.stock.purchasable) {
    return (
      <Link href={`/products/${product.slug}`} className={buttonClass("ghost", "sm", "w-full border-line!")}>
        View details
      </Link>
    );
  }
  if (product.variants.length) {
    return (
      <Link href={`/products/${product.slug}`} className={buttonClass("outline", "sm", "w-full")}>
        Choose options
      </Link>
    );
  }
  return (
    <button type="button" className={buttonClass("dark", "sm", "w-full")} onClick={() => add(product, product.minOrderQty ?? 1)}>
      <ShoppingCart className="h-4 w-4" aria-hidden /> Add to cart
    </button>
  );
}
