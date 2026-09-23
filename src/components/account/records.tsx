import Link from "next/link";
import { ChevronRight, MapPin, Truck } from "lucide-react";
import type { Order, Quote } from "@/lib/types";
import { formatDate, formatMoney } from "@/lib/format";
import { orderStatusMeta, quoteStatusMeta } from "@/lib/status";
import { StatusBadge } from "@/components/ui/badge";

export function OrdersList({ orders, hrefBase }: { orders: Order[]; hrefBase: string }) {
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-white">
      <table className="w-full text-sm">
        <thead className="hidden bg-canvas text-left text-xs font-semibold tracking-wide text-body uppercase sm:table-header-group">
          <tr>
            <th className="px-5 py-3">Order</th>
            <th className="px-5 py-3">Date</th>
            <th className="px-5 py-3">Fulfilment</th>
            <th className="px-5 py-3">Status</th>
            <th className="px-5 py-3 text-right">Total</th>
            <th className="w-8" />
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {orders.map((o) => (
            <tr key={o.id} className="group relative flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-4 hover:bg-canvas sm:table-row sm:p-0">
              <td className="font-semibold text-ink sm:px-5 sm:py-4">
                <Link href={`${hrefBase}/${o.number}`} className="after:absolute after:inset-0">
                  {o.number}
                </Link>
                <span className="block text-xs font-normal text-body">{o.items.reduce((n, i) => n + i.quantity, 0)} items</span>
              </td>
              <td className="text-body sm:px-5 sm:py-4">{formatDate(o.createdAt)}</td>
              <td className="text-body sm:px-5 sm:py-4">
                <span className="inline-flex items-center gap-1.5">
                  {o.fulfilment.method === "pickup" ? <MapPin className="h-4 w-4" aria-hidden /> : <Truck className="h-4 w-4" aria-hidden />}
                  {o.fulfilment.method === "pickup" ? "Pickup" : "Delivery"}
                </span>
              </td>
              <td className="sm:px-5 sm:py-4">
                <StatusBadge tone={orderStatusMeta[o.status].tone}>{orderStatusMeta[o.status].label}</StatusBadge>
              </td>
              <td className="ml-auto font-semibold text-ink sm:ml-0 sm:px-5 sm:py-4 sm:text-right">{formatMoney(o.total)}</td>
              <td className="hidden pr-4 sm:table-cell">
                <ChevronRight className="h-4 w-4 text-muted group-hover:text-ink" aria-hidden />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function QuotesList({ quotes, hrefBase }: { quotes: Quote[]; hrefBase: string }) {
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-white">
      <table className="w-full text-sm">
        <thead className="hidden bg-canvas text-left text-xs font-semibold tracking-wide text-body uppercase sm:table-header-group">
          <tr>
            <th className="px-5 py-3">Reference</th>
            <th className="px-5 py-3">Project</th>
            <th className="px-5 py-3">Updated</th>
            <th className="px-5 py-3">Status</th>
            <th className="w-8" />
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {quotes.map((q) => (
            <tr key={q.id} className="group relative flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-4 hover:bg-canvas sm:table-row sm:p-0">
              <td className="font-semibold whitespace-nowrap text-ink sm:px-5 sm:py-4">
                <Link href={`${hrefBase}/${q.reference}`} className="after:absolute after:inset-0">
                  {q.reference}
                </Link>
              </td>
              <td className="w-full text-body sm:w-auto sm:max-w-xs sm:px-5 sm:py-4">
                <span className="line-clamp-1 text-ink">{q.productsRequested}</span>
                <span className="text-xs">{q.items.length} items{q.fileIds.length ? ` · ${q.fileIds.length} files` : ""}</span>
              </td>
              <td className="text-body sm:px-5 sm:py-4">{formatDate(q.updatedAt)}</td>
              <td className="sm:px-5 sm:py-4">
                <StatusBadge tone={quoteStatusMeta[q.status].tone}>{quoteStatusMeta[q.status].label}</StatusBadge>
              </td>
              <td className="hidden pr-4 sm:table-cell">
                <ChevronRight className="h-4 w-4 text-muted group-hover:text-ink" aria-hidden />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
