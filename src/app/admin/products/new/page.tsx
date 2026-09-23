import type { Metadata } from "next";
import { getDb } from "@/server/db";
import { requireStaff } from "@/server/auth/session";
import { AdminHeader } from "@/components/admin/ui";
import { ProductEditor } from "@/components/admin/product-editor";

export const metadata: Metadata = { title: "New product" };

export default async function NewProductPage() {
  await requireStaff("catalog");
  const db = getDb();
  return (
    <>
      <AdminHeader title="Add product" description="New products get placeholder illustrations until photos are added." back={{ href: "/admin/products", label: "Products" }} />
      <ProductEditor product={null} categories={db.categories} allProducts={db.products.map(({ id, name, sku }) => ({ id, name, sku }))} />
    </>
  );
}
