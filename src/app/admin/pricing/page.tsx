import type { Metadata } from "next";
import Link from "next/link";
import { getDb } from "@/server/db";
import { requireStaff } from "@/server/auth/session";
import { AdminHeader, FilterTabs, Table, Td, Th } from "@/components/admin/ui";
import { PricingRow } from "@/components/admin/inline-editors";
import { isActiveSale } from "@/lib/pricing";

export const metadata: Metadata = { title: "Pricing" };

export default async function PricingPage({ searchParams }: PageProps<"/admin/pricing">) {
  await requireStaff("catalog");
  const { filter } = await searchParams;
  const db = getDb();
  const all = db.products;
  const lists = {
    all,
    sale: all.filter((p) => isActiveSale(p.pricing)),
    contractor: all.filter((p) => p.pricing.contractor !== null),
    restricted: all.filter((p) => p.pricing.visibility !== "public" || p.pricing.retail === null),
  };
  const key = (typeof filter === "string" && filter in lists ? filter : "all") as keyof typeof lists;
  return (
    <>
      <AdminHeader
        title="Pricing"
        description={
          <>
            Retail, sale and contractor prices plus per-product price visibility. Only <strong className="text-ink">approved contractors</strong> ever receive contractor prices — the server strips them from pages for everyone else.
          </>
        }
      />
      <FilterTabs
        active={key}
        tabs={[
          { key: "all", label: "All", href: "/admin/pricing", count: lists.all.length },
          { key: "sale", label: "On sale", href: "/admin/pricing?filter=sale", count: lists.sale.length },
          { key: "contractor", label: "Has contractor price", href: "/admin/pricing?filter=contractor", count: lists.contractor.length },
          { key: "restricted", label: "Hidden / quote-only", href: "/admin/pricing?filter=restricted", count: lists.restricted.length },
        ]}
      />
      <Table>
        <thead>
          <tr>
            <Th>Product</Th>
            <Th>Retail</Th>
            <Th>Sale</Th>
            <Th>Contractor</Th>
            <Th>Visibility</Th>
            <Th />
          </tr>
        </thead>
        <tbody>
          {lists[key].map((p) => (
            <tr key={p.id}>
              <Td className="min-w-56">
                <Link href={`/admin/products/${p.id}#pricing`} className="font-medium text-ink hover:underline">
                  {p.name}
                </Link>
                <span className="block text-xs text-body">
                  {p.sku} · per {p.pricing.unit}
                </span>
              </Td>
              <PricingRow product={{ id: p.id, name: p.name, pricing: p.pricing }} />
            </tr>
          ))}
        </tbody>
      </Table>
      <p className="mt-4 text-xs text-body">Leave retail blank for “Request a Quote” products. A single contractor tier is used in the prototype; the pricing module supports adding tiers or customer-specific pricing later.</p>
    </>
  );
}
