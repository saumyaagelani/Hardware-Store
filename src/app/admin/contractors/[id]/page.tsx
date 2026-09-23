import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDb } from "@/server/db";
import { requireStaff } from "@/server/auth/session";
import { formatDate, formatDateTime, formatMoney } from "@/lib/format";
import { contractorStatusMeta } from "@/lib/status";
import { AdminHeader } from "@/components/admin/ui";
import { Panel } from "@/components/account/dashboard-ui";
import { ContractorDecision } from "@/components/admin/contractor-decision";
import { StatusBadge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Contractor application" };

export default async function ContractorApplicationPage({ params }: PageProps<"/admin/contractors/[id]">) {
  await requireStaff("customers");
  const { id } = await params;
  const db = getDb();
  const u = db.users.find((x) => x.id === id && x.accountType === "contractor");
  if (!u || !u.contractorStatus) notFound();
  const app = u.contractorApplication;
  const orders = db.orders.filter((o) => o.userId === u.id);
  const quotes = db.quotes.filter((q) => q.userId === u.id);
  const a = u.businessAddress;
  const rows: [string, string | undefined][] = [
    ["Business type", app?.businessType],
    ["Years in business", app?.yearsInBusiness],
    ["HST / business number", u.hstNumber],
    ["Trade licence", app?.tradeLicence],
    ["Website", app?.website],
    ["Est. monthly purchases", app?.estimatedMonthlySpend],
    ["Preferred contact", u.preferredContact === "text" ? "Text message" : u.preferredContact],
  ];
  return (
    <>
      <AdminHeader
        title={u.companyName ?? u.fullName}
        description={`Applied ${formatDateTime(app?.submittedAt ?? u.createdAt)}`}
        back={{ href: "/admin/contractors", label: "Contractor applications" }}
        actions={<StatusBadge tone={contractorStatusMeta[u.contractorStatus].tone}>{contractorStatusMeta[u.contractorStatus].label}</StatusBadge>}
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          <Panel title="Applicant">
            <div className="grid gap-5 text-sm sm:grid-cols-2">
              <div>
                <p className="font-semibold text-ink">{u.fullName}</p>
                <p className="text-body">{u.email}</p>
                <p className="text-body">{u.phone}</p>
              </div>
              {a ? (
                <div>
                  <p className="text-xs font-semibold tracking-wide text-body uppercase">Business address</p>
                  <p className="mt-1 text-ink">
                    {a.line1}
                    {a.line2 ? `, ${a.line2}` : ""}
                    <br />
                    {a.city}, {a.province} {a.postalCode}
                  </p>
                </div>
              ) : null}
            </div>
          </Panel>
          <Panel title="Business details">
            <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
              {rows.map(([k, v]) => (
                <div key={k}>
                  <dt className="text-body">{k}</dt>
                  <dd className="text-ink capitalize">{v || "—"}</dd>
                </div>
              ))}
            </dl>
            {app?.notes ? (
              <div className="mt-4 border-t border-line pt-4 text-sm">
                <p className="text-body">About their work</p>
                <p className="mt-1 text-ink">{app.notes}</p>
              </div>
            ) : null}
          </Panel>
          {app?.reviewedAt ? (
            <Panel title="Review history">
              <p className="text-sm text-body">
                {contractorStatusMeta[u.contractorStatus].label} by <span className="font-semibold text-ink">{app.reviewedBy}</span> on {formatDate(app.reviewedAt, { dateStyle: "long" })}
              </p>
              {app.decisionNote ? <p className="mt-2 rounded-md bg-mist p-3 text-sm text-ink">“{app.decisionNote}”</p> : null}
            </Panel>
          ) : null}
          <Panel title="Activity">
            <p className="text-sm text-body">
              {orders.length} orders ({formatMoney(orders.reduce((s, o) => s + o.total, 0))}) · {quotes.length} quote requests ·{" "}
              <Link href={`/admin/customers/${u.id}`} className="font-semibold text-ink underline">
                open customer record
              </Link>
            </p>
          </Panel>
        </div>
        <Panel title="Decision" className="h-fit">
          <p className="mb-4 text-sm text-body">{contractorStatusMeta[u.contractorStatus].description}</p>
          <ContractorDecision userId={u.id} status={u.contractorStatus} />
        </Panel>
      </div>
    </>
  );
}
