"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, Menu, X } from "lucide-react";
import { departments, primaryNav } from "@/config/site";
import type { NavCategory } from "./types";
import { cn } from "@/lib/cn";

export function MainNav({ categories }: { categories: NavCategory[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- close the menu on navigation
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative hidden bg-ink lg:block" ref={ref}>
      <nav aria-label="Main" className="container-page">
        <div className="flex h-[4.5rem] items-stretch border-t border-ink-line">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mega-menu"
            className={cn("my-3 flex shrink-0 items-center gap-2.5 border-r border-ink-line pr-5 text-[0.875rem] font-medium transition-colors xl:pr-7 xl:text-[0.9375rem]", open ? "text-gold" : "text-white hover:text-gold")}
          >
            {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
            Shop all<span className="hidden xl:inline"> products</span>
          </button>
          <ul className="flex flex-1 items-stretch justify-evenly">
            {primaryNav.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href} className="flex">
                  <Link
                    href={item.href}
                    className={cn(
                      "relative flex items-center px-1.5 text-[0.875rem] font-medium whitespace-nowrap transition-colors xl:px-3 xl:text-[0.9375rem]",
                      active ? "text-gold after:absolute after:inset-x-1.5 after:bottom-0 after:h-0.5 after:bg-gold xl:after:inset-x-3" : "text-white hover:text-gold",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
            <li className="hidden xl:flex">
              <Link href="/deals" className={cn("flex items-center px-3 text-[0.9375rem] font-medium whitespace-nowrap transition-colors xl:px-3", pathname === "/deals" ? "text-gold" : "text-white hover:text-gold")}>
                Deals
              </Link>
            </li>
          </ul>
          <Link href="/contractors" className="flex shrink-0 items-center gap-1.5 pl-3 text-[0.875rem] font-medium whitespace-nowrap text-gold hover:text-white xl:pl-4 xl:text-[0.9375rem]">
            Contractor pricing <ArrowUpRight className="h-4.5 w-4.5" aria-hidden />
          </Link>
        </div>
      </nav>

      {open ? (
        <div id="mega-menu" className="absolute inset-x-0 top-full z-40 border-t border-ink-line bg-white shadow-menu">
          <div className="container-page grid grid-cols-[1fr_280px] gap-10 py-8">
            <div className="grid grid-cols-3 gap-x-8 gap-y-8 xl:grid-cols-5">
              {departments.map((dept) => {
                const cats = categories.filter((c) => c.department === dept.id);
                return (
                  <div key={dept.id}>
                    <p className="mb-3 font-display text-xs font-bold tracking-[0.14em] text-body uppercase">{dept.name}</p>
                    <ul className="space-y-4">
                      {cats.map((c) => (
                        <li key={c.slug}>
                          <Link href={`/shop/${c.slug}`} className="group flex items-center justify-between font-semibold text-ink hover:text-gold-dark">
                            {c.name}
                            <span className="text-xs font-normal text-muted">{c.count}</span>
                          </Link>
                          <ul className="mt-1.5 space-y-1">
                            {c.subcategories.slice(0, 4).map((s) => (
                              <li key={s.slug}>
                                <Link href={`/shop/${c.slug}?sub=${s.slug}`} className="text-[0.8125rem] text-body hover:text-ink hover:underline">
                                  {s.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
            <div className="flex flex-col gap-3">
              <Link href="/deals" className="group relative overflow-hidden rounded-lg bg-ink p-5 text-white">
                <p className="eyebrow text-gold!">Fall Flooring Event</p>
                <p className="mt-1 font-display text-xl leading-tight font-bold">Save up to 20% on waterproof vinyl</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-gold">
                  Shop deals <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </span>
              </Link>
              <Link href="/quote" className="group rounded-lg border border-line bg-mist p-5">
                <p className="font-display text-lg font-bold text-ink">Planning a bigger project?</p>
                <p className="mt-1 text-sm text-body">Send measurements or photos for a free, itemised quote.</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-ink">
                  Get a free quote <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </span>
              </Link>
              <Link href="/shop" className="text-sm font-semibold text-ink underline decoration-gold decoration-2 underline-offset-4">
                Browse all products
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
