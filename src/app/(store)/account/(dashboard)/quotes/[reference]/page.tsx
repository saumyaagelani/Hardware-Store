import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/server/auth/session";
import { getDb } from "@/server/db";
import { formatDate } from "@/lib/format";
import { quoteStatusMeta } from "@/lib/status";
import { PageHeader } from "@/components/account/dashboard-ui";
import { QuoteDetailBody } from "@/components/account/quote-detail";
import { StatusBadge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Quote details", robots: { index: false } };

export default async function QuoteDetailPage({ params }: PageProps<"/account/quotes/[reference]">) {
  const { reference } = await params;
  const user = await requireUser("/account/quotes");
  const db = getDb();
  const quote = db.quotes.find((q) => q.reference === reference && q.userId === user.id);
  if (!quote) notFound();
  const meta = quoteStatusMeta[quote.status];
  return (
    <>
      <Link href="/account/quotes" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-body hover:text-ink">
        <ArrowLeft className="h-4 w-4" aria-hidden /> All quotes
      </Link>
      <PageHeader title={`Quote ${quote.reference}`} description={`Submitted ${formatDate(quote.createdAt, { dateStyle: "long" })} · ${meta.description}`} actions={<StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>} />
      <QuoteDetailBody quote={quote} files={db.uploads.filter((u) => quote.fileIds.includes(u.id))} productSlugs={Object.fromEntries(db.products.map((p) => [p.id, p.slug]))} />
    </>
  );
}
