import type { MetadataRoute } from "next";
import { getDb } from "@/server/db";
import { env } from "@/config/env";

export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  const db = getDb();
  const url = (path: string) => new URL(path, env.siteUrl).toString();
  return [
    ...["/", "/shop", "/deals", "/quote", "/contractors", "/contact"].map((p) => ({ url: url(p), changeFrequency: "weekly" as const, priority: p === "/" ? 1 : 0.8 })),
    ...db.categories.map((c) => ({ url: url(`/shop/${c.slug}`), changeFrequency: "weekly" as const, priority: 0.7 })),
    ...db.products.filter((p) => p.active).map((p) => ({ url: url(`/products/${p.slug}`), lastModified: p.updatedAt, changeFrequency: "weekly" as const, priority: 0.6 })),
  ];
}
