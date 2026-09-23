import type { Metadata } from "next";
import { getDb } from "@/server/db";
import { requireStaff } from "@/server/auth/session";
import { AdminHeader } from "@/components/admin/ui";
import { DeliverySettingsForm } from "@/components/admin/settings-forms";

export const metadata: Metadata = { title: "Delivery settings" };

export default async function DeliveryPage() {
  await requireStaff("settings");
  const s = getDb().settings;
  return (
    <>
      <AdminHeader title="Delivery settings" description="Postal-code delivery zones, fees and rules used at checkout. Route optimisation and live scheduling are out of scope for this phase." />
      <DeliverySettingsForm zones={s.deliveryZones} oversizedUnitThreshold={s.oversizedUnitThreshold} deliveryNotes={s.deliveryNotes} taxRate={s.taxRate} taxLabel={s.taxLabel} />
    </>
  );
}
