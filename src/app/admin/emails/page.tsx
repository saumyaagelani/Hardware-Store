import type { Metadata } from "next";
import { getDb } from "@/server/db";
import { requireStaff } from "@/server/auth/session";
import type { EmailTemplate } from "@/lib/types";
import { formatDateTime } from "@/lib/format";
import { AdminHeader } from "@/components/admin/ui";
import { EmailSettingsForm } from "@/components/admin/settings-forms";
import { StatusBadge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Email notifications" };

const labels: Record<EmailTemplate, { label: string; audience: string }> = {
  account_registered: { label: "Account registration", audience: "Customer" },
  contractor_application_received: { label: "Contractor application received", audience: "Applicant" },
  contractor_application_admin: { label: "New contractor application", audience: "Admin" },
  contractor_approved: { label: "Contractor approved", audience: "Applicant" },
  contractor_rejected: { label: "Contractor not approved", audience: "Applicant" },
  quote_received: { label: "Quote request received", audience: "Customer" },
  quote_admin: { label: "New quote request", audience: "Admin" },
  quote_status: { label: "Quote status update", audience: "Customer" },
  order_confirmation: { label: "Order confirmation", audience: "Customer" },
  order_admin: { label: "New order", audience: "Admin" },
  order_status: { label: "Order status update", audience: "Customer" },
  contact_admin: { label: "Contact form submission", audience: "Admin" },
  newsletter_signup: { label: "Newsletter signup", audience: "Subscriber" },
};

export default async function EmailsPage() {
  await requireStaff("settings");
  const db = getDb();
  return (
    <>
      <AdminHeader
        title="Email notifications"
        description="In the prototype, emails are rendered and logged here instead of being sent. Connect an email provider (Postmark, SendGrid, SES…) in Stage 2."
      />
      <EmailSettingsForm templates={db.settings.emailNotifications} adminEmail={db.settings.adminNotificationEmail} labels={labels} />
      <h2 className="mt-10 mb-3 font-display text-lg font-bold text-ink">Notification log ({db.emailLog.length})</h2>
      <ul className="space-y-2">
        {db.emailLog.map((e) => (
          <li key={e.id}>
            <details className="group rounded-lg border border-line bg-white">
              <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-sm">
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-ink">{e.subject}</span>
                  <span className="text-xs text-body">
                    {labels[e.template]?.label} · to {e.to}
                  </span>
                </span>
                <span className="text-xs text-body">{formatDateTime(e.createdAt)}</span>
                <StatusBadge tone={e.status === "simulated" ? "info" : e.status === "sent" ? "success" : e.status === "disabled" ? "neutral" : "danger"}>{e.status === "simulated" ? "Simulated" : e.status}</StatusBadge>
              </summary>
              <pre className="border-t border-line bg-canvas px-4 py-3 font-sans text-sm whitespace-pre-wrap text-ink">{e.body}</pre>
            </details>
          </li>
        ))}
      </ul>
    </>
  );
}
