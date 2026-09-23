import type { Metadata } from "next";
import { ShieldCheck, Smartphone, Trash2 } from "lucide-react";
import { requireUser } from "@/server/auth/session";
import { formatDateTime } from "@/lib/format";
import { PageHeader, Panel } from "@/components/account/dashboard-ui";
import { PasswordForm } from "@/components/account/password-form";

export const metadata: Metadata = { title: "Settings & security", robots: { index: false } };

export default async function SettingsPage() {
  const user = await requireUser("/account/settings");
  return (
    <>
      <PageHeader title="Settings & security" description="Manage your password and account security." />
      <div className="space-y-5">
        <Panel title="Change password">
          <PasswordForm />
        </Panel>
        <Panel title="Account security">
          <ul className="divide-y divide-line text-sm">
            <li className="flex items-center gap-3 py-3 first:pt-0">
              <ShieldCheck className="h-5 w-5 text-success" aria-hidden />
              <span className="flex-1">
                <span className="block font-medium text-ink">Last sign-in</span>
                <span className="text-body">{formatDateTime(user.lastLoginAt)}</span>
              </span>
            </li>
            <li className="flex items-center gap-3 py-3">
              <Smartphone className="h-5 w-5 text-muted" aria-hidden />
              <span className="flex-1">
                <span className="block font-medium text-ink">Two-step verification</span>
                <span className="text-body">Planned for the production release.</span>
              </span>
              <span className="rounded-full bg-mist px-2.5 py-1 text-xs font-semibold text-body">Coming soon</span>
            </li>
            <li className="flex items-center gap-3 py-3 last:pb-0">
              <Trash2 className="h-5 w-5 text-muted" aria-hidden />
              <span className="flex-1">
                <span className="block font-medium text-ink">Close account</span>
                <span className="text-body">Contact our team to close your account and remove your data.</span>
              </span>
            </li>
          </ul>
        </Panel>
      </div>
    </>
  );
}
