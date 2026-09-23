import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/server/auth/session";
import { getDb } from "@/server/db";
import { formatDate } from "@/lib/format";
import { orderStatusMeta } from "@/lib/status";
import { PageHeader } from "@/components/account/dashboard-ui";
import { OrderDetailBody } from "@/components/account/order-detail";
import { StatusBadge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Order details", robots: { index: false } };

export default async function OrderDetailPage({ params }: PageProps<"/account/orders/[number]">) {
  const { number } = await params;
  const user = await requireUser("/account/orders");
  const order = getDb().orders.find((o) => o.number === number && o.userId === user.id);
  if (!order) notFound();
  return (
    <>
      <Link href="/account/orders" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-body hover:text-ink">
        <ArrowLeft className="h-4 w-4" aria-hidden /> All orders
      </Link>
      <PageHeader title={`Order ${order.number}`} description={`Placed ${formatDate(order.createdAt, { dateStyle: "long" })}`} actions={<StatusBadge tone={orderStatusMeta[order.status].tone}>{orderStatusMeta[order.status].label}</StatusBadge>} />
      <OrderDetailBody order={order} />
    </>
  );
}
