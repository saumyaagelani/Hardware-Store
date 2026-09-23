"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BadgePercent, ChevronDown, FileText, HardHat, Menu, Phone, Store, UserRound } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { departments } from "@/config/site";
import { business } from "@/config/business";
import type { HeaderUser, NavCategory } from "./types";
import { Logo } from "./logo";
import { cn } from "@/lib/cn";

export function MobileNav({ categories, user }: { categories: NavCategory[]; user: HeaderUser | null }) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>("flooring");
  const pathname = usePathname();
  // eslint-disable-next-line react-hooks/set-state-in-effect -- close the drawer on navigation
  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="-ml-2 rounded-md p-2 text-ink hover:bg-mist lg:hidden" aria-label="Open menu">
        <Menu className="h-6 w-6" aria-hidden />
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Menu" variant="drawer" side="left">
        <div className="flex flex-col">
          <div className="border-b border-line px-5 py-4">
            <Logo />
          </div>
          <div className="grid grid-cols-2 gap-2 border-b border-line p-4">
            <Link href="/quote" className="flex items-center justify-center gap-2 rounded-md bg-gold px-3 py-3 text-sm font-semibold text-ink">
              <FileText className="h-4 w-4" aria-hidden /> Free Quote
            </Link>
            <Link href={user ? "/account" : "/account/login"} className="flex items-center justify-center gap-2 rounded-md bg-ink px-3 py-3 text-sm font-semibold text-white">
              <UserRound className="h-4 w-4" aria-hidden /> {user ? "My Account" : "Sign In"}
            </Link>
          </div>
          <nav aria-label="Mobile" className="px-2 py-2">
            <Link href="/shop" className="flex items-center gap-3 rounded-md px-3 py-3 font-semibold text-ink hover:bg-mist">
              <Store className="h-5 w-5 text-body" aria-hidden /> All Products
            </Link>
            <Link href="/deals" className="flex items-center gap-3 rounded-md px-3 py-3 font-semibold text-ink hover:bg-mist">
              <BadgePercent className="h-5 w-5 text-danger" aria-hidden /> Deals & Sale
            </Link>
            <p className="mt-3 mb-1 px-3 font-display text-xs font-bold tracking-[0.14em] text-body uppercase">Departments</p>
            <ul>
              {departments.map((dept) => {
                const isOpen = expanded === dept.id;
                const cats = categories.filter((c) => c.department === dept.id);
                return (
                  <li key={dept.id} className="border-b border-line last:border-0">
                    <button
                      type="button"
                      onClick={() => setExpanded(isOpen ? null : dept.id)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between px-3 py-3.5 text-left font-semibold text-ink"
                    >
                      {dept.name}
                      <ChevronDown className={cn("h-4 w-4 text-body transition-transform", isOpen && "rotate-180")} aria-hidden />
                    </button>
                    {isOpen ? (
                      <ul className="pb-3">
                        {cats.map((c) => (
                          <li key={c.slug}>
                            <Link href={`/shop/${c.slug}`} className="flex items-center justify-between rounded-md px-5 py-2.5 text-[0.9375rem] text-ink hover:bg-mist">
                              {c.name}
                              <span className="text-xs text-muted">{c.count}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                );
              })}
            </ul>
            <p className="mt-4 mb-1 px-3 font-display text-xs font-bold tracking-[0.14em] text-body uppercase">Services</p>
            <Link href="/contractors" className="flex items-center gap-3 rounded-md px-3 py-3 text-ink hover:bg-mist">
              <HardHat className="h-5 w-5 text-body" aria-hidden /> Contractor Program
            </Link>
            <Link href="/contact" className="flex items-center gap-3 rounded-md px-3 py-3 text-ink hover:bg-mist">
              <Phone className="h-5 w-5 text-body" aria-hidden /> Contact & Location
            </Link>
          </nav>
          <div className="mt-2 border-t border-line bg-canvas p-5 text-sm text-body">
            <p className="font-semibold text-ink">Need help?</p>
            <a href={business.phoneHref} className="mt-1 block font-semibold text-ink">
              {business.phone}
            </a>
            <p className="mt-1">{business.hours[0].days}: {business.hours[0].time}</p>
          </div>
        </div>
      </Dialog>
    </>
  );
}
