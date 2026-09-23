import { CheckCircle2, Clock, PackageX, AlertTriangle } from "lucide-react";
import type { StockDisplay } from "@/lib/stock";
import { cn } from "@/lib/cn";

const toneText = {
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
  special: "text-special",
} as const;

const icons = {
  in_stock: CheckCircle2,
  low_stock: AlertTriangle,
  out_of_stock: PackageX,
  special_order: Clock,
} as const;

export function StockIndicator({ stock, showDetail = false, className }: { stock: StockDisplay; showDetail?: boolean; className?: string }) {
  const Icon = icons[stock.status];
  return (
    <div className={cn("flex items-start gap-1.5 text-[0.8125rem]", className)}>
      <Icon className={cn("mt-px h-4 w-4 shrink-0", toneText[stock.tone])} aria-hidden />
      <span>
        <span className={cn("font-semibold", toneText[stock.tone])}>{stock.label}</span>
        {showDetail && stock.detail ? <span className="text-body"> · {stock.detail}</span> : null}
      </span>
    </div>
  );
}
