import Link from "next/link";
import { Suspense } from "react";
import { FileText, HardHat } from "lucide-react";
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
import { buttonClass } from "@/components/ui/button";

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
      <div className="border-b border-line bg-white">
        <div className="container-page flex h-16 items-center gap-3 sm:h-20 lg:gap-8">
          <MobileNav categories={categories} user={headerUser} />
          <Logo className="shrink-0" />
          <Suspense fallback={<div className="hidden h-11 flex-1 lg:block" />}>
            <HeaderSearch className="hidden max-w-2xl flex-1 lg:flex" />
          </Suspense>
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            {contractorActive ? (
              <span className="hidden items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-xs font-bold text-gold xl:inline-flex">
                <HardHat className="h-3.5 w-3.5" aria-hidden /> Contractor pricing
              </span>
            ) : null}
            <span className="hidden md:block">
              <Link href="/quote" className={buttonClass("primary", "md")}>
                <FileText className="h-4 w-4" aria-hidden /> Free Quote
              </Link>
            </span>
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
