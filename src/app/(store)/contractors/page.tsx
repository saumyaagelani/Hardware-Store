import type { Metadata } from "next";
import { BadgeDollarSign, CheckCircle2, ClipboardList, HardHat, Truck, Users, Warehouse } from "lucide-react";
import { getCurrentUser } from "@/server/auth/session";
import { getDb } from "@/server/db";
import { ButtonLink } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { contractorStatusMeta } from "@/lib/status";
import { StatusBadge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Contractor Program",
  description: "Apply for a trade account to unlock contractor pricing, project quotes and job-site delivery.",
  alternates: { canonical: "/contractors" },
};

const benefits = [
  { icon: BadgeDollarSign, title: "Contractor pricing", body: "Trade prices appear automatically on eligible products whenever you're signed in." },
  { icon: ClipboardList, title: "Project quotes & takeoffs", body: "Send plans and measurements and get itemised quotes for full jobs." },
  { icon: Truck, title: "Job-site delivery", body: "Delivery to your site with scheduling requests, or pickup from the contractor yard." },
  { icon: Warehouse, title: "Special orders", body: "Access to special-order lines and extended ranges from our suppliers." },
  { icon: Users, title: "Dedicated contact", body: "A named account contact for orders, returns and product questions." },
  { icon: HardHat, title: "Trade-only products", body: "Some products show pricing to approved trade accounts only." },
];

export default async function ContractorsPage() {
  const user = await getCurrentUser();
  const status = user?.accountType === "contractor" ? user.contractorStatus : undefined;
  const pitch = getDb().content.contractorPitch;
  return (
    <>
      <section className="bg-ink text-white">
        <div className="container-page py-6">
          <Breadcrumbs items={[{ label: "Contractor Program" }]} />
        </div>
        <div className="container-page grid gap-10 pb-14 lg:grid-cols-[1.2fr_1fr] lg:items-center lg:pb-20">
          <div>
            <p className="eyebrow text-gold!">Contractor & trade program</p>
            <h1 className="mt-3 text-4xl leading-tight font-extrabold sm:text-5xl">Trade pricing and service for the pros.</h1>
            <p className="mt-4 max-w-xl text-lg text-white/75">{pitch}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {status ? (
                <ButtonLink href="/contractors/apply/submitted" size="lg">
                  View application status
                </ButtonLink>
              ) : (
                <ButtonLink href="/contractors/apply" size="lg">
                  <HardHat className="h-5 w-5" aria-hidden /> Apply now — it&apos;s free
                </ButtonLink>
              )}
              {!user ? (
                <ButtonLink href="/account/login" size="lg" variant="outline-light">
                  Contractor sign in
                </ButtonLink>
              ) : null}
            </div>
            {status ? (
              <p className="mt-5 flex items-center gap-2 text-sm text-white/80">
                Your status: <StatusBadge tone={contractorStatusMeta[status].tone}>{contractorStatusMeta[status].label}</StatusBadge>
              </p>
            ) : null}
          </div>
          <div className="rounded-lg border border-ink-line bg-ink-soft p-6 sm:p-8">
            <p className="font-display text-lg font-bold">How approval works</p>
            <ol className="mt-5 space-y-5">
              {[
                ["Apply online", "Tell us about your business — takes about 3 minutes."],
                ["We verify", "Our team reviews your details, usually within 1–2 business days."],
                ["Start saving", "Once approved, contractor pricing appears automatically when you sign in."],
              ].map(([t, d], i) => (
                <li key={t} className="flex gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold font-display font-bold text-ink">{i + 1}</span>
                  <span>
                    <span className="block font-semibold">{t}</span>
                    <span className="text-sm text-white/70">{d}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>
      <section className="container-page py-14 lg:py-20">
        <h2 className="text-3xl font-extrabold text-ink">Why trade customers choose us</h2>
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map(({ icon: Icon, title, body }) => (
            <li key={title} className="rounded-lg border border-line p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-md bg-gold-soft text-ink">
                <Icon className="h-5.5 w-5.5" aria-hidden />
              </span>
              <p className="mt-4 font-display text-lg font-bold text-ink">{title}</p>
              <p className="mt-1 text-sm leading-relaxed text-body">{body}</p>
            </li>
          ))}
        </ul>
        <div className="mt-12 flex flex-col items-start justify-between gap-5 rounded-lg bg-mist p-6 sm:flex-row sm:items-center sm:p-8">
          <div>
            <p className="font-display text-xl font-bold text-ink">Who can apply?</p>
            <ul className="mt-2 grid gap-1.5 text-sm text-body sm:grid-cols-2 sm:gap-x-8">
              {["General contractors & renovators", "Flooring, tile & bath installers", "Builders & developers", "Property managers & designers"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" aria-hidden /> {t}
                </li>
              ))}
            </ul>
          </div>
          <ButtonLink href="/contractors/apply" variant="dark" size="lg">
            Start application
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
