import type { Metadata } from "next";
import Link from "next/link";
import { getDb } from "@/server/db";
import { requireStaff } from "@/server/auth/session";
import { describeStock } from "@/lib/stock";
import { AdminHeader, FilterTabs, Table, Td, Th } from "@/components/admin/ui";
import { InventoryRow } from "@/components/admin/inline-editors";
import { StatusBadge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Inventory" };

export default async function InventoryPage({ searchParams }: PageProps<"/admin/inventory">) {
  await requireStaff("catalog");
  const { filter } = await searchParams;
  const db = getDb();
  const all = db.products.filter((p) => p.active);
  const alerts = all.filter((p) => p.inventory.status === "low_stock" || p.inventory.status === "out_of_stock");
  const special = all.filter((p) => p.inventory.status === "special_order");
  const list = filter === "alerts" ? alerts : filter === "special" ? special : all;
  return (
    <>
      <AdminHeader title="Inventory" description="Update on-hand quantities, stock states and restock dates. Changes appear on the storefront immediately." />
      <FilterTabs
        active={typeof filter === "string" ? filter : "all"}
        tabs={[
          { key: "all", label: "All products", href: "/admin/inventory", count: all.length },
          { key: "alerts", label: "Low / out of stock", href: "/admin/inventory?filter=alerts", count: alerts.length },
          { key: "special", label: "Special order", href: "/admin/inventory?filter=special", count: special.length },
        ]}
      />
      <Table>
        <thead>
          <tr>
            <Th>Product</Th>
            <Th>Current</Th>
            <Th>Qty on hand</Th>
            <Th>Status</Th>
            <Th>Restock date</Th>
            <Th />
          </tr>
        </thead>
        <tbody>
          {list.map((p) => {
            const s = describeStock(p.inventory);
            return (
              <tr key={p.id}>
                <Td>
                  <Link href={`/admin/products/${p.id}#inventory`} className="font-medium text-ink hover:underline">
                    {p.name}
                  </Link>
                  <span className="block text-xs text-body">{p.sku} · low at {p.inventory.lowStockThreshold}</span>
                </Td>
                <Td>
                  <StatusBadge tone={s.tone === "danger" ? "danger" : s.tone === "warning" ? "warning" : s.tone === "special" ? "special" : "success"}>{s.label}</StatusBadge>
                </Td>
                <InventoryRow product={{ id: p.id, name: p.name, inventory: p.inventory }} />
              </tr>
            );
          })}
        </tbody>
      </Table>
      <p className="mt-4 text-xs text-body">
        Inventory is managed locally in this prototype. The data layer exposes an <code>externalId</code> per product so a POS or inventory system can sync stock in Stage 2.
      </p>
    </>
  );
}
