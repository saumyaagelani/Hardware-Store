import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, LogOut } from "lucide-react";
import { requireStaff } from "@/server/auth/session";
import { getDb } from "@/server/db";
import { logoutAction } from "@/app/actions/auth";
import { AdminMobileNav, AdminSidebar, type AdminCounts } from "@/components/admin/admin-nav";
import { ToastProvider } from "@/components/ui/toast";
import { initials } from "@/lib/format";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Admin" }, robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireStaff();
  const db = getDb();
  const counts: AdminCounts = {
    applications: db.users.filter((u) => u.accountType === "contractor" && u.contractorStatus === "pending").length,
    quotes: db.quotes.filter((q) => q.status === "submitted").length,
    messages: db.contactSubmissions.filter((m) => m.status === "new").length,
    orders: db.orders.filter((o) => o.status === "processing" || o.status === "awaiting_payment").length,
    lowStock: db.products.filter((p) => p.active && (p.inventory.status === "low_stock" || p.inventory.status === "out_of_stock")).length,
  };
  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-canvas">
        <AdminSidebar counts={counts} />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-white px-4 sm:px-6">
            <AdminMobileNav counts={counts} />
            <p className="hidden text-sm text-body sm:block">
              <span className="rounded bg-gold-soft px-1.5 py-0.5 text-xs font-semibold text-ink">Prototype</span> Changes are saved to the demo data store.
            </p>
            <div className="ml-auto flex items-center gap-2">
              <Link href="/" className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-ink hover:bg-mist">
                <ExternalLink className="h-4 w-4" aria-hidden /> View store
              </Link>
              <span className="flex items-center gap-2 border-l border-line pl-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-xs font-bold text-gold">{initials(user.fullName)}</span>
                <span className="hidden text-sm leading-tight sm:block">
                  <span className="block font-semibold text-ink">{user.fullName}</span>
                  <span className="block text-xs text-body capitalize">{user.role}</span>
                </span>
              </span>
              <form action={logoutAction}>
                <button type="submit" className="rounded-md p-2 text-body hover:bg-mist hover:text-ink" aria-label="Sign out">
                  <LogOut className="h-4.5 w-4.5" aria-hidden />
                </button>
              </form>
            </div>
          </header>
          <main id="main" className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
