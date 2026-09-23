"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, FolderOpen, LayoutDashboard, MapPin, Package, Settings, UserRound } from "lucide-react";
import { cn } from "@/lib/cn";

const items = [
  { href: "/account", label: "Overview", icon: LayoutDashboard },
  { href: "/account/profile", label: "Personal & company", icon: UserRound },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/quotes", label: "Quotes", icon: FileText },
  { href: "/account/files", label: "Project files", icon: FolderOpen },
  { href: "/account/settings", label: "Settings & security", icon: Settings },
];

export function AccountNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Account" className="scrollbar-none -mx-4 flex gap-1 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
      {items.map(({ href, label, icon: Icon }) => {
        const active = href === "/account" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors",
              active ? "bg-ink text-white" : "text-ink hover:bg-mist",
            )}
          >
            <Icon className={cn("h-4.5 w-4.5", active ? "text-gold" : "text-body")} aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
