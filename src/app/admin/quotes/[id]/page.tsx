import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDb } from "@/server/db";
import { requireStaff } from "@/server/auth/session";
import { formatDateTime } from "@/lib/format";
import { quoteStatusMeta } from "@/lib/status";
import { AdminHeader } from "@/components/admin/ui";
import { QuoteDetailBody } from "@/components/account/quote-detail";
import { QuoteStatusControl } from "@/components/admin/status-controls";
import { Panel } from "@/components/account/dashboard-ui";
import { StatusBadge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Quote request" };

export default async function AdminQuotePage({ params }: PageProps<"/admin/quotes/[id]">) {
  await requireStaff("quotes");
  const { id } = await params;
  const db = getDb();
  const quote = db.quotes.find((q) => q.id === id);
  if (!quote) notFound();
  const customer = quote.userId ? db.users.find((u) => u.id === quote.userId) : undefined;
  return (
    <>
      <AdminHeader
        title={`Quote ${quote.reference}`}
        description={
          <>
            Received {formatDateTime(quote.createdAt)} from {quote.contact.fullName}
            {customer ? (
              <>
                {" · "}
                <Link href={`/admin/customers/${customer.id}`} className="font-semibold text-ink underline">
                  view customer
                </Link>
              </>
            ) : " · guest"}
          </>
        }
        back={{ href: "/admin/quotes", label: "Quote requests" }}
        actions={<StatusBadge tone={quoteStatusMeta[quote.status].tone}>{quoteStatusMeta[quote.status].label}</StatusBadge>}
      />
      <div className="grid gap-6 2xl:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-5">
          {quote.adminNotes ? <p className="rounded-md border border-gold-dark bg-gold-soft p-3 text-sm text-ink">Internal note: {quote.adminNotes}</p> : null}
          <QuoteDetailBody quote={quote} files={db.uploads.filter((u) => quote.fileIds.includes(u.id))} admin productSlugs={Object.fromEntries(db.products.map((p) => [p.id, p.slug]))} />
        </div>
        <Panel title="Update quote" className="h-fit">
          <QuoteStatusControl quoteId={quote.id} status={quote.status} quotedAmount={quote.quotedAmount} adminNotes={quote.adminNotes} />
        </Panel>
      </div>
    </>
  );
}
