"use client";

import Link from "next/link";
import { ShoppingCart, FileText } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { ButtonLink, buttonClass } from "@/components/ui/button";
import { formatMoney } from "@/lib/format";
import { useCart } from "./cart-provider";
import { usePricedCart } from "./use-priced-cart";
import { CartLineItem } from "./cart-line-item";

export function CartDrawer() {
  const { drawerOpen, closeDrawer, lines } = useCart();
  const { snapshot, loading } = usePricedCart(drawerOpen);

  return (
    <Dialog open={drawerOpen} onClose={closeDrawer} title={`Your cart (${lines.reduce((n, l) => n + l.quantity, 0)})`} variant="drawer">
      {lines.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-16 text-center">
          <ShoppingCart className="mb-3 h-10 w-10 text-muted" aria-hidden />
          <p className="font-semibold text-ink">Your cart is empty</p>
          <p className="mt-1 text-sm text-body">Browse flooring, doors and bath products to get started.</p>
          <ButtonLink href="/shop" variant="dark" className="mt-6" onClick={closeDrawer}>
            Start shopping
          </ButtonLink>
        </div>
      ) : (
        <div className="flex h-full flex-col">
          <ul className="flex-1 divide-y divide-line px-5">
            {loading || !snapshot
              ? lines.map((l, i) => (
                  <li key={i} className="flex gap-4 py-4">
                    <div className="skeleton h-20 w-20 rounded-md" />
                    <div className="flex-1 space-y-2">
                      <div className="skeleton h-4 w-3/4 rounded" />
                      <div className="skeleton h-4 w-1/2 rounded" />
                    </div>
                  </li>
                ))
              : snapshot.lines.map((line) => <CartLineItem key={line.key} line={line} compact />)}
          </ul>
          <div className="sticky bottom-0 border-t border-line bg-white p-5">
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-body">Subtotal</span>
              <span className="text-lg font-bold text-ink">{snapshot ? formatMoney(snapshot.totals.subtotal) : "—"}</span>
            </div>
            {snapshot?.contractorPricing ? <p className="mb-2 text-xs font-semibold text-gold-dark">Contractor pricing applied</p> : null}
            <p className="mb-4 text-xs text-body">Taxes and delivery calculated at checkout.</p>
            <div className="grid gap-2">
              <ButtonLink href="/checkout" variant="primary" size="lg" onClick={closeDrawer} className="w-full">
                Checkout
              </ButtonLink>
              <div className="grid grid-cols-2 gap-2">
                <Link href="/cart" className={buttonClass("outline", "md", "w-full")} onClick={closeDrawer}>
                  View cart
                </Link>
                <Link href="/quote?from=cart" className={buttonClass("ghost", "md", "w-full border-line!")} onClick={closeDrawer}>
                  <FileText className="h-4 w-4" aria-hidden /> Quote cart
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </Dialog>
  );
}
