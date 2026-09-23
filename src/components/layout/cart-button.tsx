"use client";

import { ShoppingCart } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";

export function CartButton() {
  const { count, hydrated, openDrawer } = useCart();
  return (
    <button type="button" onClick={openDrawer} className="relative flex items-center gap-2 rounded-md p-2 text-ink hover:bg-mist" aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}>
      <span className="relative">
        <ShoppingCart className="h-6 w-6" aria-hidden />
        {hydrated && count > 0 ? (
          <span className="absolute -top-2 -right-2.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[0.6875rem] font-bold text-ink ring-2 ring-white">
            {count > 99 ? "99+" : count}
          </span>
        ) : null}
      </span>
      <span className="hidden text-left text-xs leading-tight xl:block">
        <span className="block text-body">Cart</span>
        <span className="block font-semibold text-ink">{hydrated ? `${count} item${count === 1 ? "" : "s"}` : "—"}</span>
      </span>
    </button>
  );
}
