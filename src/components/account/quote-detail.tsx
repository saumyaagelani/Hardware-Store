import Link from "next/link";
import { Download, FileText, ImageIcon } from "lucide-react";
import type { Quote, UploadedFile } from "@/lib/types";
import { formatBytes, formatDate, formatMoney } from "@/lib/format";
import { quoteStatusMeta } from "@/lib/status";
import { Panel } from "./dashboard-ui";
import { Timeline } from "./timeline";

export function QuoteDetailBody({ quote, files, admin = false, productSlugs = {} }: { quote: Quote; files: UploadedFile[]; admin?: boolean; productSlugs?: Record<string, string> }) {
  const rows: [string, string | undefined][] = [
    ["Customer type", quote.customerType.charAt(0).toUpperCase() + quote.customerType.slice(1)],
    ["Project address", quote.projectAddress],
    ["Installation", quote.installationRequired ? "Required" : "Supply only"],
    ["Fulfilment", quote.fulfilment === "delivery" ? "Delivery to project" : "Customer pickup"],
    ["Preferred date", quote.preferredDate ? formatDate(`${quote.preferredDate}T12:00:00`) : undefined],
    ["Colours / styles", quote.preferredStyles],
    ["Measurements", quote.measurements],
    ["Source", quote.source === "cart" ? "Cart → quote" : quote.source === "product" ? "Product page" : "Quote form"],
  ];
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
      <div className="space-y-5">
        {quote.status === "quoted" && quote.quotedAmount ? (
          <div className="flex flex-col gap-2 rounded-lg bg-ink p-5 text-white sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-white/70">Quoted total (before tax)</p>
              <p className="font-display text-3xl font-bold text-gold">{formatMoney(quote.quotedAmount)}</p>
            </div>
            {!admin ? <p className="text-sm text-white/80">Reply to your quote email or call us to approve.</p> : null}
          </div>
        ) : null}
        <Panel title="Requested products" bodyClassName="p-0">
          {quote.items.length ? (
            <ul className="divide-y divide-line">
              {quote.items.map((item, i) => (
                <li key={i} className="flex justify-between gap-4 px-5 py-3 text-sm">
                  <span>
                    {item.productId && productSlugs[item.productId] ? (
                      <Link href={`/products/${productSlugs[item.productId]}`} className="font-medium text-ink hover:underline">
                        {item.name}
                      </Link>
                    ) : (
                      <span className="font-medium text-ink">{item.name}</span>
                    )}
                    <span className="block text-xs text-body">
                      {item.sku ? `SKU ${item.sku}` : "Custom request"}
                      {item.optionsLabel ? ` · ${item.optionsLabel}` : ""}
                    </span>
                  </span>
                  <span className="shrink-0 font-semibold text-ink">Qty {item.quantity}</span>
                </li>
              ))}
            </ul>
          ) : null}
          <div className="border-t border-line px-5 py-4 text-sm first:border-t-0">
            <p className="text-xs font-semibold tracking-wide text-body uppercase">Request description</p>
            <p className="mt-1 whitespace-pre-line text-ink">{quote.productsRequested}</p>
          </div>
        </Panel>
        <Panel title="Project details">
          <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
            {rows
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k}>
                  <dt className="text-body">{k}</dt>
                  <dd className="whitespace-pre-line text-ink">{v}</dd>
                </div>
              ))}
          </dl>
          {quote.details ? (
            <div className="mt-4 border-t border-line pt-4 text-sm">
              <p className="text-body">Additional details</p>
              <p className="mt-1 whitespace-pre-line text-ink">{quote.details}</p>
            </div>
          ) : null}
        </Panel>
        <Panel title={`Files (${files.length})`}>
          {files.length ? (
            <ul className="grid gap-2 sm:grid-cols-2">
              {files.map((f) => (
                <li key={f.id}>
                  <a href={`/api/uploads/${f.id}`} className="flex items-center gap-3 rounded-md border border-line p-3 text-sm hover:border-ink">
                    {f.mimeType === "application/pdf" ? <FileText className="h-5 w-5 shrink-0 text-danger" aria-hidden /> : <ImageIcon className="h-5 w-5 shrink-0 text-info" aria-hidden />}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-ink">{f.originalName}</span>
                      <span className="text-xs text-body">
                        {formatBytes(f.sizeBytes)} · {formatDate(f.uploadedAt)}
                      </span>
                    </span>
                    <Download className="h-4 w-4 text-body" aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-body">No files attached.</p>
          )}
        </Panel>
      </div>
      <div className="space-y-5">
        <Panel title="Contact">
          <div className="text-sm">
            <p className="font-semibold text-ink">{quote.contact.fullName}</p>
            {quote.contact.companyName ? <p className="text-body">{quote.contact.companyName}</p> : null}
            <p className="text-body">{quote.contact.email}</p>
            <p className="text-body">{quote.contact.phone}</p>
            <p className="mt-2 text-xs text-body">
              Prefers: <span className="font-semibold text-ink capitalize">{quote.contact.preferredContact === "text" ? "Text message" : quote.contact.preferredContact}</span>
            </p>
          </div>
        </Panel>
        <Panel title="Status history">
          <Timeline entries={quote.history.map((h) => ({ label: quoteStatusMeta[h.status].label, tone: quoteStatusMeta[h.status].tone, at: h.at, note: h.note, by: admin ? h.by : undefined }))} />
        </Panel>
      </div>
    </div>
  );
}
