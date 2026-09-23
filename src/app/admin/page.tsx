import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ArrowRight, ClipboardList, DollarSign, FileText, HardHat, Mail, MessageSquare, Package, ShieldAlert } from "lucide-react";
import { getDb } from "@/server/db";
import { requireStaff } from "@/server/auth/session";
import { formatDate, formatDateTime, formatMoney } from "@/lib/format";
import { orderStatusMeta, quoteStatusMeta } from "@/lib/status";
import { describeStock } from "@/lib/stock";
import { StatusBadge } from "@/components/ui/badge";
import { Panel, StatCard } from "@/components/account/dashboard-ui";
import { AdminHeader } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Dashboard" };

/** Request time (kept outside render for React purity rules). */
function currentTime() {
  return Date.now();
}

export default async function AdminDashboard({ searchParams }: PageProps<"/admin">) {
  const user = await requireStaff();
  const { denied } = await searchParams;
  const db = getDb();
  const now = currentTime();
  const last30 = db.orders.filter((o) => now - new Date(o.createdAt).getTime() < 30 * 86400000 && o.status !== "cancelled");
  const revenue = last30.reduce((s, o) => s + o.total, 0);
  const pendingApps = db.users.filter((u) => u.accountType === "contractor" && u.contractorStatus === "pending");
  const openQuotes = db.quotes.filter((q) => ["submitted", "under_review", "info_required"].includes(q.status));
  const openOrders = db.orders.filter((o) => ["awaiting_payment", "processing", "ready_for_pickup", "out_for_delivery"].includes(o.status));
  const stockAlerts = db.products.filter((p) => p.active && (p.inventory.status === "low_stock" || p.inventory.status === "out_of_stock"));
  const newMessages = db.contactSubmissions.filter((m) => m.status === "new");
  const pipeline = db.quotes.filter((q) => q.status === "quoted").reduce((s, q) => s + (q.quotedAmount ?? 0), 0);

  // Orders per day for the last 14 days (simple bar list).
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(now - (13 - i) * 86400000);
    const key = d.toISOString().slice(0, 10);
    const orders = db.orders.filter((o) => o.createdAt.slice(0, 10) === key && o.status !== "cancelled");
    return { key, label: d.toLocaleDateString("en-CA", { month: "short", day: "numeric" }), total: orders.reduce((s, o) => s + o.total, 0), count: orders.length };
  });
  const maxDay = Math.max(...days.map((d) => d.total), 1);

  return (
    <div className="space-y-6">
      {denied ? (
        <p className="flex items-center gap-2 rounded-md bg-warning-soft p-3 text-sm text-warning">
          <ShieldAlert className="h-4 w-4" aria-hidden /> Your staff role doesn&apos;t include access to that section. Ask an administrator to update your permissions.
        </p>
      ) : null}
      <AdminHeader title={`Good day, ${user.fullName.split(" ")[0]}`} description={`Here's what's happening at the store · ${formatDate(new Date().toISOString(), { dateStyle: "full" })}`} />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Sales (30 days)" value={formatMoney(revenue)} hint={`${last30.length} orders`} icon={<DollarSign className="h-5 w-5" />} />
        <StatCard label="Open orders" value={openOrders.length} hint={`${db.orders.filter((o) => o.status === "awaiting_payment").length} awaiting e-Transfer`} icon={<ClipboardList className="h-5 w-5" />} />
        <StatCard label="Open quote requests" value={openQuotes.length} hint={`${formatMoney(pipeline)} quoted & pending`} icon={<FileText className="h-5 w-5" />} />
        <StatCard label="Contractor applications" value={pendingApps.length} hint="Awaiting review" icon={<HardHat className="h-5 w-5" />} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Panel title="Sales — last 14 days">
          <ul className="flex h-44 items-end gap-1.5" aria-label="Daily sales">
            {days.map((d) => (
              <li key={d.key} className="group relative flex h-full flex-1 flex-col justify-end">
                <span
                  className="block w-full rounded-t-sm bg-ink transition-colors group-hover:bg-gold"
                  style={{ height: `${Math.max(2, (d.total / maxDay) * 100)}%` }}
                  aria-label={`${d.label}: ${formatMoney(d.total)} from ${d.count} orders`}
                />
                <span className="pointer-events-none absolute -top-8 left-1/2 z-10 hidden -translate-x-1/2 rounded bg-ink px-2 py-1 text-xs whitespace-nowrap text-white group-hover:block">
                  {d.label}: {formatMoney(d.total)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex justify-between text-xs text-body">
            <span>{days[0].label}</span>
            <span>Today</span>
          </div>
        </Panel>
        <Panel title="Needs attention">
          <ul className="divide-y divide-line text-sm">
            {[
              { href: "/admin/contractors?status=pending", icon: HardHat, label: "Contractor applications to review", count: pendingApps.length },
              { href: "/admin/quotes?status=submitted", icon: FileText, label: "New quote requests", count: db.quotes.filter((q) => q.status === "submitted").length },
              { href: "/admin/orders?status=awaiting_payment", icon: DollarSign, label: "Orders awaiting e-Transfer", count: db.orders.filter((o) => o.status === "awaiting_payment").length },
              { href: "/admin/orders?status=tbc", icon: Package, label: "Delivery fees to confirm", count: db.orders.filter((o) => o.fulfilment.method === "delivery" && o.fulfilment.feeToBeConfirmed && o.status !== "completed" && o.status !== "cancelled").length },
              { href: "/admin/inventory?filter=alerts", icon: AlertTriangle, label: "Low / out-of-stock products", count: stockAlerts.length },
              { href: "/admin/messages", icon: MessageSquare, label: "New contact messages", count: newMessages.length },
            ].map(({ href, icon: Icon, label, count }) => (
              <li key={href}>
                <Link href={href} className="flex items-center gap-3 py-2.5 hover:text-gold-dark">
                  <Icon className="h-4.5 w-4.5 text-body" aria-hidden />
                  <span className="flex-1 text-ink">{label}</span>
                  <span className={count ? "rounded-full bg-gold px-2 py-0.5 text-xs font-bold text-ink" : "text-xs text-muted"}>{count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Recent orders" action={{ href: "/admin/orders", label: "All orders" }} bodyClassName="p-0">
          <ul className="divide-y divide-line">
            {db.orders.slice(0, 6).map((o) => (
              <li key={o.id}>
                <Link href={`/admin/orders/${o.id}`} className="flex items-center gap-3 px-5 py-3 text-sm hover:bg-canvas">
                  <span className="min-w-0 flex-1">
                    <span className="font-semibold text-ink">{o.number}</span>
                    <span className="block truncate text-xs text-body">
                      {o.customer.fullName}
                      {o.guest ? " (guest)" : ""} · {formatDateTime(o.createdAt)}
                    </span>
                  </span>
                  <StatusBadge tone={orderStatusMeta[o.status].tone}>{orderStatusMeta[o.status].label}</StatusBadge>
                  <span className="w-24 text-right font-semibold text-ink">{formatMoney(o.total)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Latest quote requests" action={{ href: "/admin/quotes", label: "All quotes" }} bodyClassName="p-0">
          <ul className="divide-y divide-line">
            {db.quotes.slice(0, 6).map((q) => (
              <li key={q.id}>
                <Link href={`/admin/quotes/${q.id}`} className="flex items-center gap-3 px-5 py-3 text-sm hover:bg-canvas">
                  <span className="min-w-0 flex-1">
                    <span className="font-semibold text-ink">{q.reference}</span>
                    <span className="block truncate text-xs text-body">
                      {q.contact.fullName} · {q.productsRequested}
                    </span>
                  </span>
                  <StatusBadge tone={quoteStatusMeta[q.status].tone}>{quoteStatusMeta[q.status].label}</StatusBadge>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Stock alerts" action={{ href: "/admin/inventory?filter=alerts", label: "Inventory" }} bodyClassName="p-0">
          <ul className="divide-y divide-line">
            {stockAlerts.slice(0, 6).map((p) => {
              const s = describeStock(p.inventory);
              return (
                <li key={p.id}>
                  <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3 px-5 py-3 text-sm hover:bg-canvas">
                    <img src={p.images[0]?.src} alt="" className="h-10 w-10 rounded bg-mist object-cover" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-ink">{p.name}</span>
                      <span className="text-xs text-body">{p.sku} · {s.detail}</span>
                    </span>
                    <StatusBadge tone={s.tone === "danger" ? "danger" : "warning"}>{s.label}</StatusBadge>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Panel>
        <Panel title="Recent notifications" action={{ href: "/admin/emails", label: "Email log" }} bodyClassName="p-0">
          <ul className="divide-y divide-line">
            {db.emailLog.slice(0, 6).map((e) => (
              <li key={e.id} className="flex items-start gap-3 px-5 py-3 text-sm">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-body" aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-ink">{e.subject}</span>
                  <span className="text-xs text-body">
                    To {e.to} · {formatDateTime(e.createdAt)}
                  </span>
                </span>
                <span className="text-xs text-muted capitalize">{e.status}</span>
              </li>
            ))}
          </ul>
          <Link href="/admin/emails" className="flex items-center justify-center gap-1 border-t border-line py-3 text-sm font-semibold text-ink hover:bg-canvas">
            View all notifications <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </Panel>
      </div>
    </div>
  );
}
