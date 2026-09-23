import type { Metadata } from "next";
import { getDb } from "@/server/db";
import { requireStaff } from "@/server/auth/session";
import { departments } from "@/config/site";
import { AdminHeader } from "@/components/admin/ui";
import { CategoryEditor } from "@/components/admin/category-editor";

export const metadata: Metadata = { title: "Categories" };

export default async function CategoriesPage() {
  await requireStaff("catalog");
  const db = getDb();
  const counts = new Map<string, number>();
  for (const p of db.products) counts.set(p.categoryId, (counts.get(p.categoryId) ?? 0) + 1);
  return (
    <>
      <AdminHeader title="Categories" description="Category names, descriptions and subcategories used in navigation, filters and SEO pages." />
      <div className="space-y-8">
        {departments.map((dept) => (
          <section key={dept.id}>
            <h2 className="mb-3 font-display text-sm font-bold tracking-[0.12em] text-body uppercase">{dept.name}</h2>
            <div className="space-y-3">
              {db.categories
                .filter((c) => c.department === dept.id)
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((c) => (
                  <CategoryEditor key={c.id} category={c} productCount={counts.get(c.id) ?? 0} />
                ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
