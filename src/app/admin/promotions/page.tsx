import type { Metadata } from "next";
import Link from "next/link";
import { getDb } from "@/server/db";
import { requireStaff } from "@/server/auth/session";
import { isActiveSale } from "@/lib/pricing";
import { AdminHeader } from "@/components/admin/ui";
import { BannerEditor } from "@/components/admin/settings-forms";
import { Panel } from "@/components/account/dashboard-ui";

export const metadata: Metadata = { title: "Promotional banners" };

export default async function PromotionsPage() {
  await requireStaff("content");
  const db = getDb();
  const announcements = db.banners.filter((b) => b.placement === "announcement").sort((a, b) => a.sortOrder - b.sortOrder);
  const promos = db.banners.filter((b) => b.placement === "promo").sort((a, b) => a.sortOrder - b.sortOrder);
  const featured = db.products.filter((p) => p.featured);
  const sale = db.products.filter((p) => isActiveSale(p.pricing));
  return (
    <>
      <AdminHeader title="Promotional banners" description="Announcement bar messages and homepage promo tiles. Featured and sale products are managed per product." />
      <div className="grid gap-6 2xl:grid-cols-[1fr_340px]">
        <div className="space-y-8">
          <section>
            <h2 className="mb-3 font-display text-lg font-bold text-ink">Announcement bar (rotates)</h2>
            <div className="space-y-3">
              {announcements.map((b) => (
                <BannerEditor key={b.id} banner={b} />
              ))}
            </div>
          </section>
          <section>
            <h2 className="mb-3 font-display text-lg font-bold text-ink">Homepage promo tiles</h2>
            <div className="space-y-3">
              {promos.map((b) => (
                <BannerEditor key={b.id} banner={b} />
              ))}
            </div>
          </section>
          <section>
            <h2 className="mb-3 font-display text-lg font-bold text-ink">Add a banner</h2>
            <BannerEditor />
          </section>
        </div>
        <div className="space-y-5">
          <Panel title={`Featured products (${featured.length})`}>
            <ul className="space-y-2 text-sm">
              {featured.map((p) => (
                <li key={p.id}>
                  <Link href={`/admin/products/${p.id}`} className="text-ink hover:underline">
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-body">Toggle “Featured on homepage” in the product editor.</p>
          </Panel>
          <Panel title={`On sale (${sale.length})`}>
            <ul className="space-y-2 text-sm">
              {sale.map((p) => (
                <li key={p.id}>
                  <Link href={`/admin/products/${p.id}#pricing`} className="text-ink hover:underline">
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-body">Set a sale price (and optional end date) under Pricing.</p>
          </Panel>
        </div>
      </div>
    </>
  );
}
