import type { Metadata } from "next";
import Link from "next/link";
import { FileText, FolderOpen, HardHat, MapPin, Package, PartyPopper, ShoppingBag, Heart, Receipt, RotateCcw } from "lucide-react";
import { requireUser } from "@/server/auth/session";
import { getDb } from "@/server/db";
import { contractorStatusMeta } from "@/lib/status";
import { PageHeader, Panel, StatCard } from "@/components/account/dashboard-ui";
import { OrdersList, QuotesList } from "@/components/account/records";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "My account", robots: { index: false } };

export default async function AccountOverview({ searchParams }: PageProps<"/account">) {
  const user = await requireUser("/account");
  const { welcome } = await searchParams;
  const db = getDb();
  const orders = db.orders.filter((o) => o.userId === user.id);
  const quotes = db.quotes.filter((q) => q.userId === user.id);
  const files = db.uploads.filter((u) => u.userId === user.id);
  const openOrders = orders.filter((o) => !["completed", "cancelled"].includes(o.status)).length;
  const activeQuotes = quotes.filter((q) => !["approved", "declined"].includes(q.status)).length;
  const status = user.accountType === "contractor" ? user.contractorStatus : undefined;

  return (
    <div className="space-y-6">
      {welcome ? (
        <p className="flex items-center gap-3 rounded-lg bg-success-soft p-4 text-sm text-success">
          <PartyPopper className="h-5 w-5 shrink-0" aria-hidden /> Welcome aboard! Your account is ready. A welcome email has been sent (simulated).
        </p>
      ) : null}
      <PageHeader
        title={`Hi, ${user.fullName.split(" ")[0]}`}
        description="Manage your orders, quotes, addresses and account details."
        actions={
          <>
            <ButtonLink href="/quote" variant="primary" size="sm">
              <FileText className="h-4 w-4" aria-hidden /> New quote
            </ButtonLink>
            <ButtonLink href="/shop" variant="outline" size="sm">
              <ShoppingBag className="h-4 w-4" aria-hidden /> Shop
            </ButtonLink>
          </>
        }
      />

      {status ? (
        <div className={cn("flex flex-col gap-4 rounded-lg p-5 sm:flex-row sm:items-center", status === "approved" ? "bg-ink text-white" : status === "pending" ? "border border-warning/30 bg-warning-soft" : "border border-danger/30 bg-danger-soft")}>
          <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-md", status === "approved" ? "bg-gold text-ink" : "bg-white text-ink")}>
            <HardHat className="h-5.5 w-5.5" aria-hidden />
          </span>
          <div className="flex-1">
            <p className={cn("font-display text-lg font-bold", status === "approved" ? "text-white" : "text-ink")}>
              Contractor account: {contractorStatusMeta[status].label}
            </p>
            <p className={cn("text-sm", status === "approved" ? "text-white/70" : "text-body")}>{contractorStatusMeta[status].description}</p>
          </div>
          <Link href="/contractors/apply/submitted" className={cn("text-sm font-semibold underline underline-offset-4", status === "approved" ? "text-gold" : "text-ink")}>
            View details
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3 rounded-lg border border-line bg-white p-5 sm:flex-row sm:items-center">
          <HardHat className="h-6 w-6 shrink-0 text-gold-dark" aria-hidden />
          <p className="flex-1 text-sm text-body">
            <span className="font-semibold text-ink">Buying for a business?</span> Upgrade to a contractor account to unlock trade pricing.
          </p>
          <ButtonLink href="/contractors/apply" size="sm" variant="dark">
            Apply now
          </ButtonLink>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Open orders" value={openOrders} hint={`${orders.length} total`} icon={<Package className="h-5 w-5" />} />
        <StatCard label="Active quotes" value={activeQuotes} hint={`${quotes.length} total`} icon={<FileText className="h-5 w-5" />} />
        <StatCard label="Project files" value={files.length} icon={<FolderOpen className="h-5 w-5" />} />
        <StatCard label="Saved addresses" value={user.deliveryAddresses.length + (user.billingAddress ? 1 : 0)} icon={<MapPin className="h-5 w-5" />} />
      </div>

      <Panel title="Recent orders" action={orders.length ? { href: "/account/orders", label: "All orders" } : undefined} bodyClassName="p-0">
        {orders.length ? (
          <div className="-m-px">
            <OrdersList orders={orders.slice(0, 3)} hrefBase="/account/orders" />
          </div>
        ) : (
          <p className="p-5 text-sm text-body">
            No orders yet. <Link href="/shop" className="font-semibold text-ink underline">Start shopping</Link>
          </p>
        )}
      </Panel>

      <Panel title="Recent quotes" action={quotes.length ? { href: "/account/quotes", label: "All quotes" } : undefined} bodyClassName="p-0">
        {quotes.length ? (
          <div className="-m-px">
            <QuotesList quotes={quotes.slice(0, 3)} hrefBase="/account/quotes" />
          </div>
        ) : (
          <p className="p-5 text-sm text-body">
            No quote requests yet. <Link href="/quote" className="font-semibold text-ink underline">Request a free quote</Link>
          </p>
        )}
      </Panel>

      <Panel title="Coming soon">
        <p className="mb-4 text-sm text-body">These account features are planned for the next phase.</p>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Heart, label: "Saved products" },
            { icon: Receipt, label: "Invoices & payment history" },
            { icon: RotateCcw, label: "One-click reorder" },
            { icon: FileText, label: "Account balances" },
          ].map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-2.5 rounded-md border border-dashed border-line px-3 py-3 text-sm text-body">
              <Icon className="h-4.5 w-4.5 text-muted" aria-hidden /> {label}
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
