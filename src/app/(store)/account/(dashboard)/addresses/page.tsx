import type { Metadata } from "next";
import { requireUser } from "@/server/auth/session";
import { PageHeader } from "@/components/account/dashboard-ui";
import { AddressBook } from "@/components/account/address-book";

export const metadata: Metadata = { title: "Addresses", robots: { index: false } };

export default async function AddressesPage() {
  const user = await requireUser("/account/addresses");
  return (
    <>
      <PageHeader title="Addresses" description="Saved addresses are offered at checkout." />
      <AddressBook billing={user.billingAddress} delivery={user.deliveryAddresses} />
    </>
  );
}
