import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CheckCircle2, Clock, HardHat, XCircle } from "lucide-react";
import { getCurrentUser } from "@/server/auth/session";
import { contractorStatusMeta } from "@/lib/status";
import { formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { business } from "@/config/business";

export const metadata: Metadata = { title: "Contractor application status", robots: { index: false } };

export default async function ContractorStatusPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/account/login?next=/contractors/apply/submitted");
  if (user.accountType !== "contractor" || !user.contractorStatus) redirect("/contractors/apply");
  const status = user.contractorStatus;
  const meta = contractorStatusMeta[status];
  const app = user.contractorApplication;
  const Icon = status === "approved" ? CheckCircle2 : status === "pending" ? Clock : XCircle;
  const steps = [
    { label: "Application submitted", done: true, date: app?.submittedAt },
    { label: "Under review", done: status !== "pending", current: status === "pending" },
    { label: status === "rejected" ? "Not approved" : "Approved — contractor pricing active", done: status === "approved", failed: status === "rejected", date: app?.reviewedAt },
  ];

  return (
    <div className="bg-canvas">
      <div className="container-page max-w-3xl py-10 lg:py-14">
        <div className="rounded-lg border border-line bg-white p-6 text-center sm:p-10">
          <Icon className={status === "approved" ? "mx-auto h-14 w-14 text-success" : status === "pending" ? "mx-auto h-14 w-14 text-warning" : "mx-auto h-14 w-14 text-danger"} aria-hidden />
          <p className="eyebrow mt-4">Contractor application</p>
          <h1 className="mt-2 text-3xl font-extrabold text-ink">
            {status === "pending" ? "Your application is awaiting approval" : status === "approved" ? "You're approved!" : "Application not approved"}
          </h1>
          <div className="mt-3 flex justify-center">
            <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>
          </div>
          <p className="mx-auto mt-4 max-w-lg text-body">{meta.description}</p>
          {status === "rejected" && app?.decisionNote ? <p className="mx-auto mt-3 max-w-lg rounded-md bg-mist p-3 text-sm text-ink">“{app.decisionNote}”</p> : null}
        </div>

        <div className="mt-5 rounded-lg border border-line bg-white p-6">
          <h2 className="font-display text-lg font-bold text-ink">{user.companyName}</h2>
          <ol className="mt-5 space-y-5">
            {steps.map((s) => (
              <li key={s.label} className="flex gap-4">
                <span
                  className={
                    s.failed
                      ? "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-danger text-white"
                      : s.done
                        ? "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success text-white"
                        : s.current
                          ? "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold text-ink"
                          : "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-mist text-muted"
                  }
                >
                  {s.failed ? <XCircle className="h-4.5 w-4.5" aria-hidden /> : s.done ? <CheckCircle2 className="h-4.5 w-4.5" aria-hidden /> : <Clock className="h-4.5 w-4.5" aria-hidden />}
                </span>
                <span>
                  <span className="block font-semibold text-ink">{s.label}</span>
                  <span className="text-sm text-body">{s.date ? formatDate(s.date, { dateStyle: "long" }) : s.current ? "Usually 1–2 business days" : ""}</span>
                </span>
              </li>
            ))}
          </ol>
          {status === "pending" ? (
            <p className="mt-6 flex gap-2 rounded-md bg-warning-soft p-3 text-sm text-warning">
              <HardHat className="h-4.5 w-4.5 shrink-0" aria-hidden /> While your application is pending, you&apos;ll see retail pricing. You can still shop, check out and request quotes.
            </p>
          ) : null}
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/shop" variant="dark">
            {status === "approved" ? "Shop with contractor pricing" : "Continue shopping"}
          </ButtonLink>
          <ButtonLink href="/account" variant="outline">
            Go to my dashboard
          </ButtonLink>
        </div>
        <p className="mt-6 text-center text-sm text-body">
          Questions about your application? Call {business.phone}.
        </p>
      </div>
    </div>
  );
}
