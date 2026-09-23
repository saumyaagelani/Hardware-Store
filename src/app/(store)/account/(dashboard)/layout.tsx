import { HardHat, LogOut } from "lucide-react";
import { requireUser } from "@/server/auth/session";
import { logoutAction } from "@/app/actions/auth";
import { AccountNav } from "@/components/account/account-nav";
import { contractorStatusMeta } from "@/lib/status";
import { initials } from "@/lib/format";
import { StatusBadge } from "@/components/ui/badge";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("/account");
  return (
    <div className="bg-canvas">
      <div className="container-page grid gap-6 py-6 lg:grid-cols-[260px_1fr] lg:gap-10 lg:py-10">
        <aside className="h-fit space-y-4 lg:sticky lg:top-6">
          <div className="flex items-center gap-3 rounded-lg border border-line bg-white p-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink font-display font-bold text-gold">{initials(user.fullName)}</span>
            <div className="min-w-0">
              <p className="truncate font-semibold text-ink">{user.fullName}</p>
              <p className="truncate text-xs text-body">{user.companyName ?? user.email}</p>
              {user.accountType === "contractor" && user.contractorStatus ? (
                <StatusBadge tone={contractorStatusMeta[user.contractorStatus].tone} className="mt-1">
                  <HardHat className="h-3 w-3" aria-hidden /> {contractorStatusMeta[user.contractorStatus].label}
                </StatusBadge>
              ) : (
                <span className="text-xs text-body">Retail customer</span>
              )}
            </div>
          </div>
          <div className="rounded-lg border border-line bg-white p-2">
            <AccountNav />
            <form action={logoutAction} className="mt-1 hidden border-t border-line pt-1 lg:block">
              <button type="submit" className="flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium text-body hover:bg-mist hover:text-ink">
                <LogOut className="h-4.5 w-4.5" aria-hidden /> Sign out
              </button>
            </form>
          </div>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
