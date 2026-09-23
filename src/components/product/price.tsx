import { HardHat, Lock, MessageSquareQuote } from "lucide-react";
import type { PriceView } from "@/lib/types";
import { formatMoney } from "@/lib/format";
import { unitSuffix } from "@/lib/pricing";
import { cn } from "@/lib/cn";

/**
 * Renders a PriceView consistently everywhere:
 * - sale: sale price + struck-through retail + % saving
 * - contractor: contractor price + "Contractor price" label + struck retail
 * - quote: "Request a Quote" treatment
 */
export function PriceDisplay({ price, size = "md", showUnit = true, className }: { price: PriceView; size?: "sm" | "md" | "lg"; showUnit?: boolean; className?: string }) {
  const amountClass = size === "lg" ? "text-3xl" : size === "md" ? "text-xl" : "text-lg";

  if (price.mode === "quote") {
    return (
      <div className={cn("flex flex-col gap-0.5", className)}>
        <span className={cn("inline-flex items-center gap-1.5 font-display font-bold text-ink", size === "lg" ? "text-2xl" : "text-lg")}>
          {price.reason === "contractors_only" ? <Lock className="h-4 w-4" aria-hidden /> : <MessageSquareQuote className="h-4 w-4" aria-hidden />}
          Request a Quote
        </span>
        <span className="text-xs text-body">
          {price.reason === "contractors_only" ? "Trade pricing — sign in as an approved contractor or request a quote" : "Pricing depends on your project"}
        </span>
      </div>
    );
  }

  const unit = showUnit && unitSuffix[price.unit] ? <span className="text-sm font-medium text-body"> {unitSuffix[price.unit]}</span> : null;

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {price.kind === "contractor" ? (
        <span className="inline-flex w-fit items-center gap-1 rounded-sm bg-ink px-1.5 py-0.5 text-[0.6875rem] font-bold tracking-wide text-gold uppercase">
          <HardHat className="h-3 w-3" aria-hidden /> Contractor price
        </span>
      ) : null}
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <span className={cn("font-display font-bold tracking-tight", amountClass, price.kind === "sale" ? "text-danger" : "text-ink")}>
          <span className="sr-only">{price.kind === "sale" ? "Sale price" : price.kind === "contractor" ? "Contractor price" : "Price"}: </span>
          {formatMoney(price.amount)}
          {unit}
        </span>
        {price.compareAt ? (
          <span className="text-sm text-body line-through">
            <span className="sr-only">Regular price: </span>
            {formatMoney(price.compareAt)}
          </span>
        ) : null}
        {price.savingsPercent && price.kind === "sale" ? (
          <span className="text-xs font-bold text-danger">Save {price.savingsPercent}%</span>
        ) : null}
      </div>
    </div>
  );
}
