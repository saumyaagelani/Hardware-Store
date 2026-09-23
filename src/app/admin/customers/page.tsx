import type { Metadata } from "next";
import Link from "next/link";
import { getDb } from "@/server/db";
import { requireStaff } from "@/server/auth/session";
import { formatDate, formatMoney } from "@/lib/format";
import { contractorStatusMeta } from "@/lib/status";
import { AdminHeader, FilterTabs, Table, Td, Th } from "@/components/admin/ui";
import { ListSearch } from "@/components/admin/list-search";
import { StatusBadge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Customers" };

export default async function CustomersPage({ searchParams }: PageProps<"/admin/customers">) {
  await requireStaff("customers");
  const { type, q } = await searchParams;
  const db = getDb();
  const customers = db.users.filter((u) => u.role === "customer");
  const term = typeof q === "string" ? q.toLowerCase() : "";
  const active = type === "regular" || type === "contractor" ? type : "all";
  const list = customers.filter((u) => (active === "all" || u.accountType === active) && (!term || `${u.fullName} ${u.email} ${u.companyName ?? ""}`.toLowerCase().includes(term)));
  return (
    <>
      <AdminHeader title="Customers" description="Registered customer and contractor accounts. Guest checkouts appear on orders only." />
      <FilterTabs
        active={active}
        tabs={[
          { key: "all", label: "All", href: "/admin/customers", count: customers.length },
          { key: "regular", label: "Retail customers", href: "/admin/customers?type=regular", count: customers.filter((u) => u.accountType === "regular").length },
          { key: "contractor", label: "Contractors", href: "/admin/customers?type=contractor", count: customers.filter((u) => u.accountType === "contractor").length },
        ]}
      />
      <ListSearch placeholder="Search name, email or company" />
      <Table>
        <thead>
          <tr>
            <Th>Customer</Th>
            <Th>Account</Th>
            <Th>Orders</Th>
            <Th>Lifetime spend</Th>
            <Th>Joined</Th>
          </tr>
        </thead>
        <tbody>
          {list.map((u) => {
            const orders = db.orders.filter((o) => o.userId === u.id && o.status !== "cancelled");
            return (
              <tr key={u.id} className="hover:bg-canvas">
                <Td>
                  <Link href={`/admin/customers/${u.id}`} className="font-semibold text-ink hover:underline">
                    {u.fullName}
                  </Link>
                  <span className="block text-xs text-body">
                    {u.email}
                    {u.companyName ? ` · ${u.companyName}` : ""}
                  </span>
                </Td>
                <Td>
                  {u.accountType === "contractor" && u.contractorStatus ? (
                    <StatusBadge tone={contractorStatusMeta[u.contractorStatus].tone}>Contractor · {contractorStatusMeta[u.contractorStatus].label}</StatusBadge>
                  ) : (
                    <StatusBadge tone="neutral">Retail</StatusBadge>
                  )}
                </Td>
                <Td className="text-body">{orders.length}</Td>
                <Td className="text-ink">{formatMoney(orders.reduce((s, o) => s + o.total, 0))}</Td>
                <Td className="whitespace-nowrap text-body">{formatDate(u.createdAt)}</Td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </>
  );
}
