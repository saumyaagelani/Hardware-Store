"use client";

import { ShoppingCart } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";

export function CartButton() {
  const { count, hydrated, openDrawer } = useCart();
  return (
    <button type="button" onClick={openDrawer} className="relative flex items-center gap-2 rounded-md p-2 text-white transition-colors hover:text-gold" aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}>
      <span className="relative">
        <ShoppingCart className="h-6 w-6" aria-hidden />
        {hydrated && count > 0 ? (
          <span className="absolute -top-2 -right-2.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[0.6875rem] font-bold text-ink ring-2 ring-ink xl:hidden">
            {count > 99 ? "99+" : count}
          </span>
        ) : null}
      </span>
      <span className="hidden items-center gap-2 text-[0.9375rem] font-medium xl:flex">
        Cart
        <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-white/10 px-2 text-xs font-bold text-white">{hydrated ? (count > 99 ? "99+" : count) : "0"}</span>
      </span>
    </button>
  );
}
