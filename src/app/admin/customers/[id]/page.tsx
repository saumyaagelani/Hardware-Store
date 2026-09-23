import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HardHat } from "lucide-react";
import { getDb } from "@/server/db";
import { requireStaff } from "@/server/auth/session";
import { formatDate, formatDateTime, formatMoney } from "@/lib/format";
import { contractorStatusMeta } from "@/lib/status";
import { AdminHeader } from "@/components/admin/ui";
import { Panel, StatCard } from "@/components/account/dashboard-ui";
import { OrdersList, QuotesList } from "@/components/account/records";
import { CustomerNotes } from "@/components/admin/customer-notes";
import { StatusBadge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Customer" };

export default async function CustomerPage({ params }: PageProps<"/admin/customers/[id]">) {
  await requireStaff("customers");
  const { id } = await params;
  const db = getDb();
  const u = db.users.find((x) => x.id === id && x.role === "customer");
  if (!u) notFound();
  const orders = db.orders.filter((o) => o.userId === u.id);
  const quotes = db.quotes.filter((q) => q.userId === u.id);
  const files = db.uploads.filter((f) => f.userId === u.id);
  const spend = orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.total, 0);
  return (
    <>
      <AdminHeader
        title={u.fullName}
        description={`${u.email} · Customer since ${formatDate(u.createdAt, { dateStyle: "long" })}`}
        back={{ href: "/admin/customers", label: "Customers" }}
        actions={
          u.accountType === "contractor" && u.contractorStatus ? (
            <Link href={`/admin/contractors/${u.id}`}>
              <StatusBadge tone={contractorStatusMeta[u.contractorStatus].tone}>
                <HardHat className="h-3 w-3" aria-hidden /> Contractor · {contractorStatusMeta[u.contractorStatus].label}
              </StatusBadge>
            </Link>
          ) : (
            <StatusBadge tone="neutral">Retail customer</StatusBadge>
          )
        }
      />
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Lifetime spend" value={formatMoney(spend)} />
        <StatCard label="Orders" value={orders.length} />
        <StatCard label="Quotes" value={quotes.length} />
        <StatCard label="Files" value={files.length} />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-5">
          <Panel title="Orders" bodyClassName="p-0">
            {orders.length ? <OrdersList orders={orders} hrefBase="/admin/orders/by-number" /> : <p className="p-5 text-sm text-body">No orders.</p>}
          </Panel>
          <Panel title="Quotes" bodyClassName="p-0">
            {quotes.length ? <QuotesList quotes={quotes} hrefBase="/admin/quotes/by-reference" /> : <p className="p-5 text-sm text-body">No quotes.</p>}
          </Panel>
        </div>
        <div className="space-y-5">
          <Panel title="Details">
            <dl className="space-y-2.5 text-sm">
              {[
                ["Phone", u.phone],
                ["Company", u.companyName],
                ["HST / business #", u.hstNumber],
                ["Preferred contact", u.preferredContact === "text" ? "Text message" : u.preferredContact],
                ["Marketing emails", u.marketingOptIn ? "Subscribed" : "Not subscribed"],
                ["Last sign-in", formatDateTime(u.lastLoginAt)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <dt className="text-body">{k}</dt>
                  <dd className="text-right text-ink capitalize">{v || "—"}</dd>
                </div>
              ))}
            </dl>
          </Panel>
          <Panel title="Addresses">
            <div className="space-y-3 text-sm">
              {u.billingAddress ? (
                <p>
                  <span className="block text-xs font-semibold text-body uppercase">Billing</span>
                  <span className="text-ink">{u.billingAddress.line1}, {u.billingAddress.city} {u.billingAddress.postalCode}</span>
                </p>
              ) : null}
              {u.deliveryAddresses.map((a, i) => (
                <p key={i}>
                  <span className="block text-xs font-semibold text-body uppercase">{a.label ?? "Delivery"}</span>
                  <span className="text-ink">{a.line1}, {a.city} {a.postalCode}</span>
                </p>
              ))}
              {!u.billingAddress && !u.deliveryAddresses.length ? <p className="text-body">No saved addresses.</p> : null}
            </div>
          </Panel>
          <Panel title="Notes">
            <CustomerNotes userId={u.id} initial={u.notes} />
          </Panel>
        </div>
      </div>
    </>
  );
}
