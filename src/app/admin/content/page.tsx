import type { Metadata } from "next";
import { getDb } from "@/server/db";
import { requireStaff } from "@/server/auth/session";
import { business } from "@/config/business";
import { AdminHeader } from "@/components/admin/ui";
import { ContentForm } from "@/components/admin/settings-forms";
import { Panel } from "@/components/account/dashboard-ui";

export const metadata: Metadata = { title: "Website content" };

export default async function ContentPage() {
  await requireStaff("content");
  return (
    <>
      <AdminHeader title="Website content" description="Editable homepage and marketing copy." />
      <div className="grid gap-6 2xl:grid-cols-[1fr_340px]">
        <ContentForm content={getDb().content} />
        <Panel title="Business details" className="h-fit">
          <dl className="space-y-2 text-sm">
            {[
              ["Name", business.name],
              ["Phone", business.phone],
              ["Email", business.email],
              ["Address", `${business.address.line1}, ${business.address.city}`],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-body">{k}</dt>
                <dd className="text-ink">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 rounded-md bg-gold-soft p-3 text-xs text-ink">
            Placeholder values. Business details live in <code>src/config/business.ts</code> so they update site-wide in one place.
          </p>
        </Panel>
      </div>
    </>
  );
}
