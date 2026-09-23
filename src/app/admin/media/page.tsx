import type { Metadata } from "next";
import Link from "next/link";
import { FileText } from "lucide-react";
import { getDb } from "@/server/db";
import { requireStaff } from "@/server/auth/session";
import { AdminHeader, FilterTabs } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Images & documents" };

export default async function MediaPage({ searchParams }: PageProps<"/admin/media">) {
  await requireStaff("catalog");
  const { tab } = await searchParams;
  const products = getDb().products;
  const images = products.flatMap((p) => p.images.map((img) => ({ ...img, product: p })));
  const docs = products.flatMap((p) => p.documents.map((d) => ({ ...d, product: p })));
  const active = tab === "documents" ? "documents" : "images";
  return (
    <>
      <AdminHeader
        title="Images & documents"
        description="Product imagery and technical documents across the catalogue. Current images are placeholder illustrations — replace them with final photography per product."
      />
      <FilterTabs
        active={active}
        tabs={[
          { key: "images", label: "Images", href: "/admin/media", count: images.length },
          { key: "documents", label: "Documents", href: "/admin/media?tab=documents", count: docs.length },
        ]}
      />
      {active === "images" ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
          {images.map((img) => (
            <li key={img.src}>
              <Link href={`/admin/products/${img.product.id}#media`} className="group block overflow-hidden rounded-lg border border-line bg-white">
                <img src={img.src} alt={img.alt} loading="lazy" className="aspect-square w-full bg-mist object-cover" />
                <span className="block truncate px-2.5 py-2 text-xs text-ink group-hover:underline">{img.product.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {docs.map((d) => (
            <li key={`${d.product.id}-${d.id}`} className="flex items-center gap-3 rounded-lg border border-line bg-white p-4">
              <FileText className="h-6 w-6 shrink-0 text-danger" aria-hidden />
              <div className="min-w-0 flex-1">
                <a href={d.url} target="_blank" rel="noopener" className="block truncate text-sm font-semibold text-ink hover:underline">
                  {d.name}
                </a>
                <Link href={`/admin/products/${d.product.id}#media`} className="block truncate text-xs text-body hover:underline">
                  {d.product.name}
                </Link>
              </div>
              <span className="text-xs text-muted">{d.sizeKb} KB</span>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-6 text-xs text-body">Stage 2: connect object storage (e.g. S3/R2) for direct image and PDF uploads from this screen.</p>
    </>
  );
}
