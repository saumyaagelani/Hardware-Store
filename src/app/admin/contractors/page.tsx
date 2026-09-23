import type { Metadata } from "next";
import Link from "next/link";
import { getDb } from "@/server/db";
import { requireStaff } from "@/server/auth/session";
import { formatDate } from "@/lib/format";
import { contractorStatusMeta } from "@/lib/status";
import type { ContractorStatus } from "@/lib/types";
import { AdminHeader, FilterTabs, Table, Td, Th } from "@/components/admin/ui";
import { StatusBadge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Contractor applications" };

export default async function ContractorsAdminPage({ searchParams }: PageProps<"/admin/contractors">) {
  await requireStaff("customers");
  const { status } = await searchParams;
  const all = getDb()
    .users.filter((u) => u.accountType === "contractor")
    .sort((a, b) => (b.contractorApplication?.submittedAt ?? b.createdAt).localeCompare(a.contractorApplication?.submittedAt ?? a.createdAt));
  const active = (["pending", "approved", "rejected"] as const).includes(status as ContractorStatus) ? (status as ContractorStatus) : "all";
  const list = active === "all" ? all : all.filter((u) => u.contractorStatus === active);
  return (
    <>
      <AdminHeader title="Contractor applications" description="Review trade account applications. Approving an account unlocks contractor pricing the next time the customer loads a page." />
      <FilterTabs
        active={active}
        tabs={[
          { key: "all", label: "All", href: "/admin/contractors", count: all.length },
          ...(["pending", "approved", "rejected"] as const).map((s) => ({ key: s, label: contractorStatusMeta[s].label, href: `/admin/contractors?status=${s}`, count: all.filter((u) => u.contractorStatus === s).length })),
        ]}
      />
      <Table>
        <thead>
          <tr>
            <Th>Business</Th>
            <Th>Contact</Th>
            <Th>Type</Th>
            <Th>Applied</Th>
            <Th>Status</Th>
            <Th />
          </tr>
        </thead>
        <tbody>
          {list.map((u) => (
            <tr key={u.id} className="hover:bg-canvas">
              <Td>
                <Link href={`/admin/contractors/${u.id}`} className="font-semibold text-ink hover:underline">
                  {u.companyName}
                </Link>
                <span className="block text-xs text-body">{u.hstNumber ?? "No HST # provided"}</span>
              </Td>
              <Td>
                <span className="text-ink">{u.fullName}</span>
                <span className="block text-xs text-body">{u.email}</span>
              </Td>
              <Td className="text-body">{u.contractorApplication?.businessType ?? "—"}</Td>
              <Td className="whitespace-nowrap text-body">{formatDate(u.contractorApplication?.submittedAt ?? u.createdAt)}</Td>
              <Td>{u.contractorStatus ? <StatusBadge tone={contractorStatusMeta[u.contractorStatus].tone}>{contractorStatusMeta[u.contractorStatus].label}</StatusBadge> : null}</Td>
              <Td className="text-right">
                <Link href={`/admin/contractors/${u.id}`} className="text-sm font-semibold whitespace-nowrap text-ink underline decoration-gold decoration-2 underline-offset-2">
                  {u.contractorStatus === "pending" ? "Review" : "View"}
                </Link>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
      {!list.length ? <p className="mt-6 text-center text-sm text-body">No applications in this view.</p> : null}
    </>
  );
}
