"use client";

import { useCallback } from "react";
import { useCart } from "@/components/cart/cart-provider";
import { track } from "@/lib/analytics";

/** Add to cart, fire the analytics event and open the mini-cart as confirmation. */
export function useAddToCart() {
  const { addItem, openDrawer } = useCart();
  return useCallback(
    (product: { id: string; name: string; sku: string }, quantity: number, options?: Record<string, string>) => {
      addItem(product.id, quantity, options);
      track("add_to_cart", { item_id: product.sku, item_name: product.name, quantity });
      openDrawer();
    },
    [addItem, openDrawer],
  );
}
