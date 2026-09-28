import Link from "next/link";
import { Suspense } from "react";
import { ArrowUpRight, HardHat } from "lucide-react";
import { getCurrentUser } from "@/server/auth/session";
import { getDb } from "@/server/db";
import { categoryProductCounts, getCategories } from "@/server/services/catalog";
import { Logo } from "./logo";
import { AnnouncementBar } from "./announcement-bar";
import { HeaderSearch } from "./header-search";
import { CartButton } from "./cart-button";
import { AccountMenu } from "./account-menu";
import { MainNav } from "./main-nav";
import { MobileNav } from "./mobile-nav";
import type { HeaderUser, NavCategory } from "./types";

export async function SiteHeader() {
  const user = await getCurrentUser();
  const counts = categoryProductCounts();
  const categories: NavCategory[] = getCategories().map((c) => ({
    slug: c.slug,
    name: c.name,
    department: c.department,
    subcategories: c.subcategories,
    count: counts[c.id] ?? 0,
  }));
  const announcements = getDb()
    .banners.filter((b) => b.placement === "announcement" && b.active)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(({ id, title, ctaHref, ctaLabel }) => ({ id, title, ctaHref, ctaLabel }));
  const headerUser: HeaderUser | null = user
    ? {
        firstName: user.fullName.split(" ")[0],
        fullName: user.fullName,
        role: user.role,
        accountType: user.accountType,
        contractorStatus: user.contractorStatus,
        companyName: user.companyName,
      }
    : null;
  const contractorActive = user?.accountType === "contractor" && user.contractorStatus === "approved";

  return (
    <header className="relative z-30">
      <a href="#main" className="sr-only z-50 bg-gold px-4 py-2 font-semibold text-ink focus:not-sr-only focus:absolute focus:top-2 focus:left-2">
        Skip to content
      </a>
      <AnnouncementBar items={announcements} />
      <div className="bg-ink text-white">
        <div className="container-page flex h-16 items-center gap-3 sm:h-20 lg:h-24 lg:gap-10">
          <MobileNav categories={categories} user={headerUser} />
          <Logo tone="light" className="shrink-0" />
          <Suspense fallback={<div className="hidden h-14 flex-1 lg:block" />}>
            <HeaderSearch className="mx-auto hidden max-w-xl flex-1 lg:flex" />
          </Suspense>
          <div className="ml-auto flex items-center gap-1 sm:gap-2 lg:ml-0">
            {contractorActive ? (
              <span className="hidden items-center gap-1.5 rounded-full border border-gold/40 px-3 py-1.5 text-xs font-bold text-gold 2xl:inline-flex">
                <HardHat className="h-3.5 w-3.5" aria-hidden /> Contractor pricing
              </span>
            ) : null}
            <Link href="/quote" className="hidden items-center gap-1.5 px-2 text-[0.9375rem] font-semibold whitespace-nowrap text-white hover:text-gold md:inline-flex">
              Get a free quote <ArrowUpRight className="h-4.5 w-4.5" aria-hidden />
            </Link>
            <AccountMenu user={headerUser} />
            <CartButton />
          </div>
        </div>
        <div className="container-page pb-3 lg:hidden">
          <Suspense fallback={<div className="h-11" />}>
            <HeaderSearch id="site-search-mobile" />
          </Suspense>
        </div>
      </div>
      <MainNav categories={categories} />
    </header>
  );
}
