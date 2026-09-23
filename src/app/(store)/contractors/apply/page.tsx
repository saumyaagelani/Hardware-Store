import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/session";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ContractorForm } from "@/components/account/contractor-form";

export const metadata: Metadata = { title: "Apply for a Contractor Account", alternates: { canonical: "/contractors/apply" } };

export default async function ContractorApplyPage() {
  const user = await getCurrentUser();
  if (user && user.accountType === "contractor" && user.contractorStatus !== "rejected") redirect("/contractors/apply/submitted");
  const a = user?.businessAddress ?? user?.billingAddress;
  return (
    <div className="bg-canvas">
      <div className="container-page max-w-3xl py-6 lg:py-10">
        <Breadcrumbs items={[{ label: "Contractor Program", href: "/contractors" }, { label: "Apply" }]} />
        <div className="mt-6 rounded-lg border border-line bg-white p-6 sm:p-10">
          <p className="eyebrow">Trade account application</p>
          <h1 className="mt-2 text-3xl font-extrabold text-ink">Apply for a contractor account</h1>
          <p className="mt-2 mb-8 text-body">
            {user ? "We'll upgrade your existing account once approved — your order history stays in place." : "Takes about 3 minutes. We'll review your application and email you once it's approved."}
          </p>
          <ContractorForm
            signedIn={Boolean(user)}
            prefill={{
              contactName: user?.fullName ?? "",
              email: user?.email ?? "",
              phone: user?.phone ?? "",
              companyName: user?.companyName ?? "",
              hstNumber: user?.hstNumber ?? "",
              businessAddress: a ? { line1: a.line1, line2: a.line2 ?? "", city: a.city, province: a.province, postalCode: a.postalCode, country: a.country } : undefined,
            }}
          />
        </div>
      </div>
    </div>
  );
}
