import Link from "next/link";
import { ArrowRight, BadgePercent } from "lucide-react";
import type { Category } from "@/lib/types";

export function CategoryTiles({ categories, counts }: { categories: Category[]; counts: Record<string, number> }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-6">
      {categories.map((c) => (
        <li key={c.id}>
          <Link href={`/shop/${c.slug}`} className="group flex h-full flex-col overflow-hidden rounded-lg border border-line bg-white transition-shadow hover:shadow-raised">
            <span className="block aspect-[4/3] overflow-hidden bg-mist">
              <img src={`/media/categories/${c.slug}.svg`} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
            </span>
            <span className="flex flex-1 items-center justify-between gap-2 px-3.5 py-3">
              <span>
                <span className="block text-[0.9375rem] leading-tight font-semibold text-ink">{c.name}</span>
                <span className="text-xs text-body">{counts[c.id] ?? 0} products</span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted transition-colors group-hover:text-ink" aria-hidden />
            </span>
          </Link>
        </li>
      ))}
      <li>
        <Link href="/deals" className="group flex h-full min-h-44 flex-col justify-between rounded-lg bg-gold p-4 text-ink transition-colors hover:bg-gold-dark">
          <BadgePercent className="h-8 w-8" aria-hidden />
          <span>
            <span className="block font-display text-xl leading-tight font-extrabold">Deals & Sale</span>
            <span className="mt-1 inline-flex items-center gap-1 text-sm font-semibold">
              Shop savings <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </span>
          </span>
        </Link>
      </li>
    </ul>
  );
}
