"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import type { PricedCartLine } from "@/lib/cart";
import { formatMoney } from "@/lib/format";
import { unitSuffix } from "@/lib/pricing";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { StockIndicator } from "@/components/product/stock-indicator";
import { useCart } from "./cart-provider";
import { cn } from "@/lib/cn";

export function CartLineItem({ line, compact = false }: { line: PricedCartLine; compact?: boolean }) {
  const { setQuantity, removeItem } = useCart();
  return (
    <li className={cn("flex gap-4", compact ? "py-4" : "py-6")}>
      <Link href={`/products/${line.slug}`} className={cn("shrink-0 overflow-hidden rounded-md bg-mist ring-1 ring-line", compact ? "h-20 w-20" : "h-24 w-24 sm:h-28 sm:w-28")}>
        {line.image ? <img src={line.image.src} alt={line.image.alt} className="h-full w-full object-cover" loading="lazy" /> : null}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium tracking-wide text-body uppercase">{line.brand}</p>
            <Link href={`/products/${line.slug}`} className={cn("line-clamp-2 font-semibold text-ink hover:underline", compact ? "text-sm" : "text-[0.9375rem]")}>
              {line.name}
            </Link>
            {line.optionsLabel ? <p className="mt-0.5 text-[0.8125rem] text-body">{line.optionsLabel}</p> : null}
            <p className="mt-0.5 text-xs text-muted">SKU {line.sku}</p>
          </div>
          <div className="shrink-0 text-right">
            {line.lineTotal !== null ? (
              <>
                <p className="font-semibold text-ink">{formatMoney(line.lineTotal)}</p>
                {line.unitPrice !== null ? (
                  <p className={cn("text-xs", line.price.mode === "price" && line.price.kind === "contractor" ? "font-semibold text-gold-dark" : "text-body")}>
                    {formatMoney(line.unitPrice)} {unitSuffix[line.unit] || "each"}
                    {line.price.mode === "price" && line.price.kind === "contractor" ? " · Contractor" : ""}
                    {line.price.mode === "price" && line.price.kind === "sale" ? " · Sale" : ""}
                  </p>
                ) : null}
              </>
            ) : (
              <p className="text-sm font-semibold text-ink">Quote</p>
            )}
          </div>
        </div>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
          <div className="flex items-center gap-3">
            <QuantityStepper size="sm" value={line.quantity} onChange={(q) => setQuantity(line.key, q)} label={`Quantity for ${line.name}`} />
            {!compact ? <StockIndicator stock={line.stock} /> : null}
          </div>
          <button type="button" onClick={() => removeItem(line.key)} className="inline-flex items-center gap-1 text-[0.8125rem] font-medium text-body hover:text-danger">
            <Trash2 className="h-4 w-4" aria-hidden /> Remove
          </button>
        </div>
        {line.issue ? <p className="mt-2 rounded-sm bg-warning-soft px-2 py-1 text-xs font-medium text-warning">{line.issue}</p> : null}
      </div>
    </li>
  );
}
