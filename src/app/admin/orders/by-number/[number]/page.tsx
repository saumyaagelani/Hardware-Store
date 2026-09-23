import { notFound, redirect } from "next/navigation";
import { getDb } from "@/server/db";
import { requireStaff } from "@/server/auth/session";

/** Resolve a human-friendly order number to the admin order page. */
export default async function OrderByNumber({ params }: PageProps<"/admin/orders/by-number/[number]">) {
  await requireStaff("orders");
  const { number } = await params;
  const order = getDb().orders.find((o) => o.number === number);
  if (!order) notFound();
  redirect(`/admin/orders/${order.id}`);
}
