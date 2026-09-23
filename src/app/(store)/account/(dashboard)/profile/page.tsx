import type { Metadata } from "next";
import { requireUser } from "@/server/auth/session";
import { PageHeader } from "@/components/account/dashboard-ui";
import { ProfileForm } from "@/components/account/profile-form";

export const metadata: Metadata = { title: "Personal & company details", robots: { index: false } };

export default async function ProfilePage() {
  const user = await requireUser("/account/profile");
  return (
    <>
      <PageHeader title="Personal & company details" description="Keep your contact details up to date so we can reach you about orders and quotes." />
      <ProfileForm
        email={user.email}
        isContractor={user.accountType === "contractor"}
        initial={{
          fullName: user.fullName,
          phone: user.phone,
          companyName: user.companyName ?? "",
          hstNumber: user.hstNumber ?? "",
          preferredContact: user.preferredContact,
          marketingOptIn: Boolean(user.marketingOptIn),
        }}
      />
    </>
  );
}
