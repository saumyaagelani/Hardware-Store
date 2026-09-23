import type { Metadata } from "next";
import Link from "next/link";
import { Paperclip } from "lucide-react";
import { getDb } from "@/server/db";
import { requireStaff } from "@/server/auth/session";
import { formatDateTime, formatMoney } from "@/lib/format";
import { quoteStatusMeta, quoteStatusOrder } from "@/lib/status";
import { AdminHeader, FilterTabs, Table, Td, Th } from "@/components/admin/ui";
import { ListSearch } from "@/components/admin/list-search";
import { StatusBadge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Quote requests" };

export default async function AdminQuotesPage({ searchParams }: PageProps<"/admin/quotes">) {
  await requireStaff("quotes");
  const { status, q } = await searchParams;
  const db = getDb();
  const active = typeof status === "string" ? status : "all";
  const term = typeof q === "string" ? q.toLowerCase() : "";
  const quotes = db.quotes.filter((x) => (active === "all" || x.status === active) && (!term || `${x.reference} ${x.contact.fullName} ${x.contact.email} ${x.productsRequested}`.toLowerCase().includes(term)));
  return (
    <>
      <AdminHeader title="Quote requests" description="Free quote requests from the quote form, product pages and cart-to-quote." />
      <FilterTabs
        active={active}
        tabs={[
          { key: "all", label: "All", href: "/admin/quotes", count: db.quotes.length },
          ...quoteStatusOrder.map((s) => ({ key: s, label: quoteStatusMeta[s].label, href: `/admin/quotes?status=${s}`, count: db.quotes.filter((x) => x.status === s).length })),
        ]}
      />
      <ListSearch placeholder="Search reference, customer or products" />
      <Table>
        <thead>
          <tr>
            <Th>Reference</Th>
            <Th>Customer</Th>
            <Th>Request</Th>
            <Th>Received</Th>
            <Th>Status</Th>
            <Th className="text-right">Quoted</Th>
          </tr>
        </thead>
        <tbody>
          {quotes.map((x) => (
            <tr key={x.id} className="hover:bg-canvas">
              <Td>
                <Link href={`/admin/quotes/${x.id}`} className="font-semibold whitespace-nowrap text-ink hover:underline">
                  {x.reference}
                </Link>
                <span className="block text-xs text-body capitalize">{x.source === "cart" ? "From cart" : x.source}</span>
              </Td>
              <Td>
                <span className="text-ink">{x.contact.fullName}</span>
                <span className="block text-xs text-body capitalize">
                  {x.customerType}
                  {x.userId ? " · account" : " · guest"}
                </span>
              </Td>
              <Td className="max-w-xs">
                <span className="line-clamp-1 text-ink">{x.productsRequested}</span>
                <span className="flex items-center gap-2 text-xs text-body">
                  {x.items.length} items
                  {x.fileIds.length ? (
                    <span className="inline-flex items-center gap-0.5">
                      <Paperclip className="h-3 w-3" aria-hidden /> {x.fileIds.length}
                    </span>
                  ) : null}
                  {x.installationRequired ? " · install" : ""}
                </span>
              </Td>
              <Td className="whitespace-nowrap text-body">{formatDateTime(x.createdAt)}</Td>
              <Td>
                <StatusBadge tone={quoteStatusMeta[x.status].tone}>{quoteStatusMeta[x.status].label}</StatusBadge>
              </Td>
              <Td className="text-right whitespace-nowrap">{x.quotedAmount ? formatMoney(x.quotedAmount) : "—"}</Td>
            </tr>
          ))}
        </tbody>
      </Table>
      {!quotes.length ? <p className="mt-6 text-center text-sm text-body">No quote requests in this view.</p> : null}
    </>
  );
}
