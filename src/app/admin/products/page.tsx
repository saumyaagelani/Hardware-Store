import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Star } from "lucide-react";
import { getDb } from "@/server/db";
import { requireStaff } from "@/server/auth/session";
import { formatMoney } from "@/lib/format";
import { describeStock, stockStatusOptions } from "@/lib/stock";
import { isActiveSale } from "@/lib/pricing";
import { AdminHeader, Table, Td, Th } from "@/components/admin/ui";
import { ListSearch } from "@/components/admin/list-search";
import { StatusBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = { title: "Products" };

const visibilityLabel = { public: "Public", contractors_only: "Contractors only", hidden: "Hidden (quote)" };

export default async function AdminProductsPage({ searchParams }: PageProps<"/admin/products">) {
  await requireStaff("catalog");
  const { q, category, stock } = await searchParams;
  const db = getDb();
  const cats = new Map(db.categories.map((c) => [c.id, c.name]));
  const term = typeof q === "string" ? q.toLowerCase() : "";
  const products = db.products.filter(
    (p) =>
      (!term || `${p.name} ${p.sku} ${p.brand}`.toLowerCase().includes(term)) &&
      (!category || p.categoryId === category) &&
      (!stock || p.inventory.status === stock),
  );

  return (
    <>
      <AdminHeader
        title="Products"
        description={`${products.length} of ${db.products.length} products`}
        actions={
          <ButtonLink href="/admin/products/new" size="sm">
            <Plus className="h-4 w-4" aria-hidden /> Add product
          </ButtonLink>
        }
      />
      <ListSearch
        placeholder="Search name, SKU or brand"
        selects={[
          { name: "category", label: "Category", options: db.categories.map((c) => ({ value: c.id, label: c.name })) },
          { name: "stock", label: "Stock", options: stockStatusOptions },
        ]}
      />
      <Table>
        <thead>
          <tr>
            <Th>Product</Th>
            <Th>Category</Th>
            <Th className="text-right">Retail</Th>
            <Th className="text-right">Sale</Th>
            <Th className="text-right">Contractor</Th>
            <Th>Price visibility</Th>
            <Th>Stock</Th>
            <Th>Status</Th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => {
            const s = describeStock(p.inventory);
            return (
              <tr key={p.id} className="hover:bg-canvas">
                <Td>
                  <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3">
                    <img src={p.images[0]?.src} alt="" className="h-11 w-11 shrink-0 rounded bg-mist object-cover ring-1 ring-line" />
                    <span className="min-w-0">
                      <span className="flex items-center gap-1 font-semibold text-ink hover:underline">
                        {p.name}
                        {p.featured ? <Star className="h-3.5 w-3.5 fill-gold text-gold-dark" aria-label="Featured" /> : null}
                      </span>
                      <span className="text-xs text-body">
                        {p.sku} · {p.brand}
                      </span>
                    </span>
                  </Link>
                </Td>
                <Td className="whitespace-nowrap text-body">{cats.get(p.categoryId)}</Td>
                <Td className="text-right whitespace-nowrap">{p.pricing.retail !== null ? formatMoney(p.pricing.retail) : <span className="text-muted">Quote</span>}</Td>
                <Td className="text-right whitespace-nowrap">{p.pricing.sale !== null ? <span className={isActiveSale(p.pricing) ? "font-semibold text-danger" : "text-muted line-through"}>{formatMoney(p.pricing.sale)}</span> : "—"}</Td>
                <Td className="text-right whitespace-nowrap">{p.pricing.contractor !== null ? formatMoney(p.pricing.contractor) : "—"}</Td>
                <Td className="whitespace-nowrap text-body">{visibilityLabel[p.pricing.visibility]}</Td>
                <Td className="whitespace-nowrap">
                  <StatusBadge tone={s.tone === "danger" ? "danger" : s.tone === "warning" ? "warning" : s.tone === "special" ? "special" : "success"}>
                    {s.label}
                    {p.inventory.status !== "special_order" ? ` · ${p.inventory.quantity}` : ""}
                  </StatusBadge>
                </Td>
                <Td>{p.active ? <span className="text-xs font-semibold text-success">Active</span> : <span className="text-xs font-semibold text-muted">Draft</span>}</Td>
              </tr>
            );
          })}
        </tbody>
      </Table>
      {!products.length ? <p className="mt-6 text-center text-sm text-body">No products match your filters.</p> : null}
    </>
  );
}
