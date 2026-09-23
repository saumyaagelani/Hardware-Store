import type { Metadata } from "next";
import { FileText } from "lucide-react";
import { requireUser } from "@/server/auth/session";
import { getDb } from "@/server/db";
import { PageHeader } from "@/components/account/dashboard-ui";
import { QuotesList } from "@/components/account/records";
import { EmptyState } from "@/components/ui/empty-state";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = { title: "My quotes", robots: { index: false } };

export default async function QuotesPage() {
  const user = await requireUser("/account/quotes");
  const quotes = getDb().quotes.filter((q) => q.userId === user.id);
  return (
    <>
      <PageHeader
        title="Quotes"
        description="Every quote request you've sent us, with its current status."
        actions={
          <ButtonLink href="/quote" size="sm">
            New quote request
          </ButtonLink>
        }
      />
      {quotes.length ? (
        <QuotesList quotes={quotes} hrefBase="/account/quotes" />
      ) : (
        <EmptyState icon={FileText} title="No quote requests yet" description="Request a free quote for a project, a single product or everything in your cart.">
          <ButtonLink href="/quote" variant="dark">
            Request a quote
          </ButtonLink>
        </EmptyState>
      )}
    </>
  );
}
