import type { Metadata } from "next";
import Link from "next/link";
import { getDb } from "@/server/db";
import { requireStaff } from "@/server/auth/session";
import { formatDateTime, formatMoney } from "@/lib/format";
import { orderStatusMeta, paymentStatusMeta } from "@/lib/status";
import type { OrderStatus } from "@/lib/types";
import { AdminHeader, FilterTabs, Table, Td, Th } from "@/components/admin/ui";
import { ListSearch } from "@/components/admin/list-search";
import { StatusBadge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Orders" };

export default async function AdminOrdersPage({ searchParams }: PageProps<"/admin/orders">) {
  await requireStaff("orders");
  const { status, q } = await searchParams;
  const db = getDb();
  const term = typeof q === "string" ? q.toLowerCase() : "";
  const byStatus = (s?: string) =>
    db.orders.filter((o) => (s === "tbc" ? o.fulfilment.method === "delivery" && o.fulfilment.feeToBeConfirmed && !["completed", "cancelled"].includes(o.status) : !s || o.status === s));
  const active = typeof status === "string" ? status : "all";
  const orders = byStatus(active === "all" ? undefined : active).filter((o) => !term || `${o.number} ${o.customer.fullName} ${o.customer.email}`.toLowerCase().includes(term));
  const tabs: { key: string; label: string }[] = [
    { key: "all", label: "All" },
    { key: "awaiting_payment", label: "Awaiting payment" },
    { key: "processing", label: "Processing" },
    { key: "ready_for_pickup", label: "Ready for pickup" },
    { key: "out_for_delivery", label: "Out for delivery" },
    { key: "completed", label: "Completed" },
    { key: "tbc", label: "Fee to confirm" },
  ];
  return (
    <>
      <AdminHeader title="Orders" description="Online orders from guests and registered customers." />
      <FilterTabs active={active} tabs={tabs.map((t) => ({ ...t, href: t.key === "all" ? "/admin/orders" : `/admin/orders?status=${t.key}`, count: byStatus(t.key === "all" ? undefined : t.key).length }))} />
      <ListSearch placeholder="Search order #, customer name or email" />
      <Table>
        <thead>
          <tr>
            <Th>Order</Th>
            <Th>Customer</Th>
            <Th>Fulfilment</Th>
            <Th>Payment</Th>
            <Th>Status</Th>
            <Th className="text-right">Total</Th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="hover:bg-canvas">
              <Td>
                <Link href={`/admin/orders/${o.id}`} className="font-semibold text-ink hover:underline">
                  {o.number}
                </Link>
                <span className="block text-xs text-body">{formatDateTime(o.createdAt)}</span>
              </Td>
              <Td>
                <span className="text-ink">{o.customer.fullName}</span>
                <span className="block text-xs text-body">{o.guest ? "Guest" : o.customer.companyName ?? "Registered"}</span>
              </Td>
              <Td className="text-body">
                {o.fulfilment.method === "pickup" ? "Pickup" : `Delivery${o.fulfilment.feeToBeConfirmed ? " · fee TBC" : ""}`}
              </Td>
              <Td>
                <StatusBadge tone={paymentStatusMeta[o.payment.status].tone}>{paymentStatusMeta[o.payment.status].label}</StatusBadge>
              </Td>
              <Td>
                <StatusBadge tone={orderStatusMeta[o.status as OrderStatus].tone}>{orderStatusMeta[o.status as OrderStatus].label}</StatusBadge>
              </Td>
              <Td className="text-right font-semibold whitespace-nowrap text-ink">{formatMoney(o.total)}</Td>
            </tr>
          ))}
        </tbody>
      </Table>
      {!orders.length ? <p className="mt-6 text-center text-sm text-body">No orders in this view.</p> : null}
    </>
  );
}
