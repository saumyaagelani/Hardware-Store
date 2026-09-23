"use client";

import { useEffect, useState, useTransition } from "react";
import { getCartAction, type CartSnapshot } from "@/app/actions/cart";
import { useCart } from "./cart-provider";

/** Fetch server-side prices for the current cart whenever it changes. */
export function usePricedCart(enabled = true) {
  const { lines, hydrated } = useCart();
  const [snapshot, setSnapshot] = useState<CartSnapshot | null>(null);
  const [pending, startTransition] = useTransition();
  const key = JSON.stringify(lines);

  useEffect(() => {
    if (!hydrated || !enabled) return;
    let cancelled = false;
    startTransition(async () => {
      const result = await getCartAction(JSON.parse(key));
      if (!cancelled) setSnapshot(result);
    });
    return () => {
      cancelled = true;
    };
  }, [key, hydrated, enabled]);

  return { snapshot, loading: !hydrated || (pending && !snapshot), refreshing: pending };
}
