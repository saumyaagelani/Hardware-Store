import type { Metadata } from "next";
import { Package } from "lucide-react";
import { requireUser } from "@/server/auth/session";
import { getDb } from "@/server/db";
import { PageHeader } from "@/components/account/dashboard-ui";
import { OrdersList } from "@/components/account/records";
import { EmptyState } from "@/components/ui/empty-state";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = { title: "My orders", robots: { index: false } };

export default async function OrdersPage() {
  const user = await requireUser("/account/orders");
  const orders = getDb().orders.filter((o) => o.userId === user.id);
  return (
    <>
      <PageHeader title="Orders" description="Track the status of your orders and view order details." />
      {orders.length ? (
        <OrdersList orders={orders} hrefBase="/account/orders" />
      ) : (
        <EmptyState icon={Package} title="No orders yet" description="When you place an order it will appear here with live status updates.">
          <ButtonLink href="/shop" variant="dark">
            Start shopping
          </ButtonLink>
        </EmptyState>
      )}
    </>
  );
}
