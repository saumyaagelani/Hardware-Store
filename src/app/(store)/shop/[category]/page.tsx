import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { parseFilters } from "@/lib/catalog-filter";
import { getCategoryBySlug } from "@/server/services/catalog";
import { CatalogPage } from "@/components/catalog/catalog-page";

export async function generateMetadata({ params }: PageProps<"/shop/[category]">): Promise<Metadata> {
  const { category } = await params;
  const cat = getCategoryBySlug(category);
  if (!cat) return { title: "Category not found" };
  return {
    title: cat.name,
    description: cat.description,
    alternates: { canonical: `/shop/${cat.slug}` },
    openGraph: { title: cat.name, description: cat.description, images: [`/media/categories/${cat.slug}.svg`] },
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps<"/shop/[category]">) {
  const { category } = await params;
  const cat = getCategoryBySlug(category);
  if (!cat) notFound();
  const filters = { ...parseFilters(await searchParams), category: cat.slug };
  const sub = cat.subcategories.find((s) => s.slug === filters.sub);

  return (
    <CatalogPage
      filters={filters}
      eyebrow="Shop by category"
      title={sub ? `${sub.name} — ${cat.name}` : cat.name}
      description={cat.description}
      showCategoryFilter={false}
      breadcrumbs={[{ label: "Shop", href: "/shop" }, ...(sub ? [{ label: cat.name, href: `/shop/${cat.slug}` }, { label: sub.name }] : [{ label: cat.name }])]}
      subcategoryLinks={[
        { slug: "all", name: `All ${cat.shortName ?? cat.name}`, href: `/shop/${cat.slug}`, active: !sub },
        ...cat.subcategories.map((s) => ({ slug: s.slug, name: s.name, href: `/shop/${cat.slug}?sub=${s.slug}`, active: sub?.slug === s.slug })),
      ]}
    />
  );
}
