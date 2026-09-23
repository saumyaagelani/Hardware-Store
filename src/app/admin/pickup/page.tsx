import type { Metadata } from "next";
import { getDb } from "@/server/db";
import { requireStaff } from "@/server/auth/session";
import { AdminHeader } from "@/components/admin/ui";
import { PickupSettingsForm } from "@/components/admin/settings-forms";

export const metadata: Metadata = { title: "Pickup settings" };

export default async function PickupPage() {
  await requireStaff("settings");
  return (
    <>
      <AdminHeader title="Pickup settings" description="Pickup locations, hours, instructions and readiness shown at checkout and on confirmations." />
      <PickupSettingsForm locations={getDb().settings.pickupLocations} />
    </>
  );
}
