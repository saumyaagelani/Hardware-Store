import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDb } from "@/server/db";
import { requireStaff } from "@/server/auth/session";
import { formatDateTime } from "@/lib/format";
import { orderStatusMeta } from "@/lib/status";
import { AdminHeader } from "@/components/admin/ui";
import { OrderDetailBody } from "@/components/account/order-detail";
import { OrderStatusControl } from "@/components/admin/status-controls";
import { Panel } from "@/components/account/dashboard-ui";
import { StatusBadge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Order" };

export default async function AdminOrderPage({ params }: PageProps<"/admin/orders/[id]">) {
  await requireStaff("orders");
  const { id } = await params;
  const order = getDb().orders.find((o) => o.id === id);
  if (!order) notFound();
  return (
    <>
      <AdminHeader
        title={`Order ${order.number}`}
        description={`Placed ${formatDateTime(order.createdAt)} · ${order.customer.fullName}${order.guest ? " (guest)" : ""}`}
        back={{ href: "/admin/orders", label: "Orders" }}
        actions={<StatusBadge tone={orderStatusMeta[order.status].tone}>{orderStatusMeta[order.status].label}</StatusBadge>}
      />
      <div className="grid gap-6 2xl:grid-cols-[1fr_320px]">
        <OrderDetailBody order={order} admin />
        <Panel title="Update order" className="h-fit">
          <OrderStatusControl orderId={order.id} status={order.status} feeToBeConfirmed={order.fulfilment.method === "delivery" && order.fulfilment.feeToBeConfirmed} />
        </Panel>
      </div>
    </>
  );
}
