import type { Metadata } from "next";
import Link from "next/link";
import { getDb } from "@/server/db";
import { requireStaff } from "@/server/auth/session";
import { AdminHeader, Table, Td, Th } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Product variations" };

export default async function VariationsPage() {
  await requireStaff("catalog");
  const products = getDb().products.filter((p) => p.variants.length);
  return (
    <>
      <AdminHeader title="Product variations" description="Products with selectable options (colour, size, finish, handing…). Edit options inside each product." />
      <Table>
        <thead>
          <tr>
            <Th>Product</Th>
            <Th>Variation groups & options</Th>
            <Th />
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <Td className="min-w-56">
                <span className="font-medium text-ink">{p.name}</span>
                <span className="block text-xs text-body">{p.sku}</span>
              </Td>
              <Td>
                <div className="space-y-2">
                  {p.variants.map((g) => (
                    <div key={g.name} className="flex flex-wrap items-center gap-1.5">
                      <span className="mr-1 text-xs font-semibold text-body">{g.name}:</span>
                      {g.options.map((o) => (
                        <span key={o.value} className="inline-flex items-center gap-1.5 rounded-full border border-line px-2 py-0.5 text-xs text-ink">
                          {o.swatch ? <span className="h-3 w-3 rounded-full ring-1 ring-line" style={{ background: o.swatch }} aria-hidden /> : null}
                          {o.label}
                          {o.priceAdjustment ? <span className="text-body">({o.priceAdjustment > 0 ? "+" : ""}{o.priceAdjustment})</span> : null}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              </Td>
              <Td className="text-right">
                <Link href={`/admin/products/${p.id}#variants`} className="text-sm font-semibold text-ink underline decoration-gold decoration-2 underline-offset-2">
                  Edit
                </Link>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
