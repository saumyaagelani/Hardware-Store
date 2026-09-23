import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2, Mail, Paperclip, UserPlus } from "lucide-react";
import { getDb } from "@/server/db";
import { getCurrentUser } from "@/server/auth/session";
import { quoteStatusMeta } from "@/lib/status";
import { formatDateTime } from "@/lib/format";
import { StatusBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = { title: "Quote request received", robots: { index: false } };

export default async function QuoteConfirmationPage({ params }: PageProps<"/quote/confirmation/[id]">) {
  const { id } = await params;
  const db = getDb();
  const quote = db.quotes.find((q) => q.id === id);
  if (!quote) notFound();
  const user = await getCurrentUser();
  if (user && quote.userId && quote.userId !== user.id && user.role === "customer") notFound();
  const files = db.uploads.filter((u) => quote.fileIds.includes(u.id));

  return (
    <div className="bg-canvas">
      <div className="container-page max-w-3xl py-10 lg:py-14">
        <div className="rounded-lg border border-line bg-white p-6 text-center sm:p-10">
          <CheckCircle2 className="mx-auto h-14 w-14 text-success" aria-hidden />
          <p className="eyebrow mt-4">Quote request received</p>
          <h1 className="mt-2 text-3xl font-extrabold text-ink sm:text-4xl">Thanks, {quote.contact.fullName.split(" ")[0]}!</h1>
          <p className="mt-4 text-sm text-body">Your quote reference</p>
          <p className="mt-1 inline-block rounded-md bg-ink px-5 py-2 font-display text-3xl font-extrabold tracking-wide text-gold">{quote.reference}</p>
          <div className="mt-4 flex justify-center">
            <StatusBadge tone={quoteStatusMeta[quote.status].tone}>{quoteStatusMeta[quote.status].label}</StatusBadge>
          </div>
          <p className="mx-auto mt-5 flex max-w-md items-center justify-center gap-2 text-sm text-body">
            <Mail className="h-4 w-4 shrink-0" aria-hidden /> Confirmation sent to {quote.contact.email} <span className="text-xs text-muted">(simulated)</span>
          </p>
          <p className="mt-2 text-sm text-body">Our team usually responds within one business day by {quote.contact.preferredContact === "text" ? "text message" : quote.contact.preferredContact}.</p>
        </div>

        <div className="mt-5 rounded-lg border border-line bg-white p-5 sm:p-6">
          <h2 className="font-display text-lg font-bold text-ink">Request summary</h2>
          <dl className="mt-4 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-body">Submitted</dt>
              <dd className="font-medium text-ink">{formatDateTime(quote.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-body">Project address</dt>
              <dd className="font-medium text-ink">{quote.projectAddress}</dd>
            </div>
            <div>
              <dt className="text-body">Installation</dt>
              <dd className="font-medium text-ink">{quote.installationRequired ? "Required" : "Supply only"}</dd>
            </div>
            <div>
              <dt className="text-body">Fulfilment</dt>
              <dd className="font-medium text-ink capitalize">{quote.fulfilment}</dd>
            </div>
          </dl>
          {quote.items.length ? (
            <ul className="mt-5 divide-y divide-line border-t border-line text-sm">
              {quote.items.map((item, i) => (
                <li key={i} className="flex justify-between gap-4 py-2.5">
                  <span className="text-ink">
                    {item.name}
                    {item.optionsLabel ? <span className="text-body"> · {item.optionsLabel}</span> : null}
                  </span>
                  <span className="shrink-0 font-medium text-ink">Qty {item.quantity}</span>
                </li>
              ))}
            </ul>
          ) : null}
          {quote.productsRequested && !quote.items.length ? <p className="mt-4 text-sm text-ink">{quote.productsRequested}</p> : null}
          {files.length ? (
            <p className="mt-4 flex items-center gap-2 text-sm text-body">
              <Paperclip className="h-4 w-4" aria-hidden /> {files.length} file{files.length === 1 ? "" : "s"} attached: {files.map((f) => f.originalName).join(", ")}
            </p>
          ) : null}
        </div>

        {!user ? (
          <div className="mt-5 flex flex-col items-start gap-4 rounded-lg bg-ink p-6 text-white sm:flex-row sm:items-center">
            <UserPlus className="h-8 w-8 shrink-0 text-gold" aria-hidden />
            <div className="flex-1">
              <p className="font-display text-lg font-bold">Track this quote online</p>
              <p className="text-sm text-white/70">Create a free account to follow quote status, upload more files and reorder.</p>
            </div>
            <ButtonLink href={`/account/register?email=${encodeURIComponent(quote.contact.email)}`}>Create account</ButtonLink>
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {user ? (
            <ButtonLink href={`/account/quotes/${quote.reference}`} variant="dark">
              View in my dashboard
            </ButtonLink>
          ) : null}
          <ButtonLink href="/shop" variant={user ? "outline" : "dark"}>
            Continue shopping
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
