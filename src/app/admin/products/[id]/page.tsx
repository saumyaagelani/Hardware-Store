import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { getDb } from "@/server/db";
import { requireStaff } from "@/server/auth/session";
import { formatDateTime } from "@/lib/format";
import { AdminHeader } from "@/components/admin/ui";
import { ProductEditor } from "@/components/admin/product-editor";

export const metadata: Metadata = { title: "Edit product" };

export default async function EditProductPage({ params, searchParams }: PageProps<"/admin/products/[id]">) {
  await requireStaff("catalog");
  const { id } = await params;
  const { created } = await searchParams;
  const db = getDb();
  const product = db.products.find((p) => p.id === id);
  if (!product) notFound();
  return (
    <>
      <AdminHeader title={product.name} description={`SKU ${product.sku} · Last updated ${formatDateTime(product.updatedAt)}`} back={{ href: "/admin/products", label: "Products" }} />
      {created ? (
        <p className="mb-4 flex items-center gap-2 rounded-md bg-success-soft p-3 text-sm text-success">
          <CheckCircle2 className="h-4 w-4" aria-hidden /> Product created.
        </p>
      ) : null}
      <ProductEditor product={product} categories={db.categories} allProducts={db.products.map(({ id, name, sku }) => ({ id, name, sku }))} />
    </>
  );
}
