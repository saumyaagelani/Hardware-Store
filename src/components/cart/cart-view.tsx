"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ArrowLeft, FileText, HardHat, Lock, MapPin, ShoppingCart } from "lucide-react";
import { useCart } from "./cart-provider";
import { usePricedCart } from "./use-priced-cart";
import { CartLineItem } from "./cart-line-item";
import { EmptyState } from "@/components/ui/empty-state";
import { ButtonLink, buttonClass } from "@/components/ui/button";
import { formatMoney } from "@/lib/format";
import { estimateDeliveryAction } from "@/app/actions/cart";
import type { DeliveryEstimate } from "@/lib/cart";
import { cn } from "@/lib/cn";

export function CartView() {
  const { lines, hydrated, clear } = useCart();
  const { snapshot, loading } = usePricedCart();

  if (hydrated && lines.length === 0) {
    return (
      <EmptyState icon={ShoppingCart} title="Your cart is empty" description="Looks like you haven't added anything yet. Browse our departments or request a quote for a larger project.">
        <ButtonLink href="/shop" variant="dark">
          Start shopping
        </ButtonLink>
        <ButtonLink href="/quote" variant="outline">
          Request a free quote
        </ButtonLink>
      </EmptyState>
    );
  }

  const totals = snapshot?.totals;
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:gap-10">
      <div>
        <div className="flex items-center justify-between border-b border-line pb-3">
          <p className="text-sm text-body">{lines.reduce((n, l) => n + l.quantity, 0)} items</p>
          <button type="button" onClick={() => window.confirm("Remove all items from your cart?") && clear()} className="text-sm font-medium text-body hover:text-danger">
            Clear cart
          </button>
        </div>
        <ul className="divide-y divide-line">
          {loading || !snapshot
            ? lines.map((_, i) => (
                <li key={i} className="flex gap-4 py-6">
                  <div className="skeleton h-28 w-28 rounded-md" />
                  <div className="flex-1 space-y-3">
                    <div className="skeleton h-4 w-2/3 rounded" />
                    <div className="skeleton h-4 w-1/3 rounded" />
                    <div className="skeleton h-9 w-32 rounded" />
                  </div>
                </li>
              ))
            : snapshot.lines.map((line) => <CartLineItem key={line.key} line={line} />)}
        </ul>
        <Link href="/shop" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink hover:text-gold-dark">
          <ArrowLeft className="h-4 w-4" aria-hidden /> Continue shopping
        </Link>
      </div>

      <aside className="h-fit space-y-4 lg:sticky lg:top-6" aria-label="Order summary">
        <div className="rounded-lg border border-line bg-canvas p-5 sm:p-6">
          <h2 className="font-display text-xl font-bold text-ink">Order summary</h2>
          {snapshot?.contractorPricing ? (
            <p className="mt-3 flex items-center gap-2 rounded-md bg-ink px-3 py-2 text-xs font-semibold text-gold">
              <HardHat className="h-4 w-4" aria-hidden /> Contractor pricing applied
            </p>
          ) : null}
          <dl className="mt-4 space-y-2.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-body">Subtotal</dt>
              <dd className="font-semibold text-ink">{totals ? formatMoney(totals.subtotal) : "—"}</dd>
            </div>
            {totals && totals.savings > 0 ? (
              <div className="flex justify-between">
                <dt className="text-body">You save</dt>
                <dd className="font-semibold text-success">−{formatMoney(totals.savings)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between">
              <dt className="text-body">Delivery / pickup</dt>
              <dd className="text-body">Calculated at checkout</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-body">HST</dt>
              <dd className="text-body">Calculated at checkout</dd>
            </div>
          </dl>
          <div className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
            <span className="font-semibold text-ink">Estimated total</span>
            <span className="font-display text-2xl font-bold text-ink">{totals ? formatMoney(totals.subtotal) : "—"}</span>
          </div>
          {totals?.hasIssues ? (
            <p className="mt-3 rounded-md bg-warning-soft p-3 text-xs text-warning">
              Some items can&apos;t be purchased online right now. Remove them to check out, or request a quote for the whole cart.
            </p>
          ) : null}
          <div className="mt-5 grid gap-2.5">
            <Link
              href="/checkout"
              aria-disabled={!snapshot || totals?.hasIssues}
              className={cn(buttonClass("primary", "lg", "w-full"), (!snapshot || totals?.hasIssues) && "pointer-events-none opacity-50")}
            >
              <Lock className="h-4.5 w-4.5" aria-hidden /> Proceed to checkout
            </Link>
            <Link href="/quote?from=cart" className={buttonClass("outline", "lg", "w-full")}>
              <FileText className="h-4.5 w-4.5" aria-hidden /> Request quote for this cart
            </Link>
          </div>
          <p className="mt-3 text-center text-xs text-body">Prefer a formal quote? We&apos;ll keep your cart and send itemised pricing.</p>
        </div>
        <DeliveryEstimator />
      </aside>
    </div>
  );
}

function DeliveryEstimator() {
  const { lines } = useCart();
  const [postal, setPostal] = useState("");
  const [estimate, setEstimate] = useState<DeliveryEstimate | null>(null);
  const [pending, start] = useTransition();
  return (
    <form
      className="rounded-lg border border-line p-5"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => setEstimate(await estimateDeliveryAction(postal, lines)));
      }}
    >
      <label htmlFor="estimate-postal" className="flex items-center gap-2 text-sm font-semibold text-ink">
        <MapPin className="h-4 w-4 text-gold-dark" aria-hidden /> Check delivery to your area
      </label>
      <div className="mt-2 flex gap-2">
        <input id="estimate-postal" value={postal} onChange={(e) => setPostal(e.target.value.toUpperCase())} placeholder="Postal code" maxLength={7} className="field-input min-h-10! py-2! uppercase" autoComplete="postal-code" />
        <button type="submit" disabled={pending || !postal} className={buttonClass("dark", "md", "h-10!")}>
          Check
        </button>
      </div>
      {estimate ? (
        <p className={cn("mt-2 text-[0.8125rem]", estimate.status === "ok" ? "text-ink" : "text-warning")} role="status">
          {estimate.status === "ok" ? (
            <>
              <strong>{estimate.feeToBeConfirmed ? "Fee to be confirmed" : estimate.fee === 0 ? "Free delivery" : formatMoney(estimate.fee)}</strong> · {estimate.message}
            </>
          ) : (
            estimate.message
          )}
        </p>
      ) : (
        <p className="mt-2 text-xs text-body">Free pickup is always available.</p>
      )}
    </form>
  );
}
