"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, HardHat, LayoutDashboard, LogOut, Package, FileText, Settings, UserRound } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import type { HeaderUser } from "./types";
import { cn } from "@/lib/cn";

export function AccountMenu({ user }: { user: HeaderUser | null }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!user) {
    return (
      <Link href="/account/login" className="flex items-center gap-2 rounded-md p-2 text-ink hover:bg-mist" aria-label="Sign in or create an account">
        <UserRound className="h-6 w-6" aria-hidden />
        <span className="hidden text-left text-xs leading-tight xl:block">
          <span className="block text-body">Sign in</span>
          <span className="block font-semibold text-ink">Account</span>
        </span>
      </Link>
    );
  }

  const staff = user.role === "admin" || user.role === "staff";
  const items = [
    ...(staff ? [{ href: "/admin", label: "Admin dashboard", icon: LayoutDashboard }] : []),
    { href: "/account", label: "My dashboard", icon: UserRound },
    { href: "/account/orders", label: "Orders", icon: Package },
    { href: "/account/quotes", label: "Quotes", icon: FileText },
    { href: "/account/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-haspopup="menu" className="flex items-center gap-2 rounded-md p-2 text-ink hover:bg-mist">
        <span className="relative">
          <UserRound className="h-6 w-6" aria-hidden />
          {user.accountType === "contractor" && user.contractorStatus === "approved" ? (
            <HardHat className="absolute -right-1.5 -bottom-1 h-3.5 w-3.5 rounded-full bg-gold p-px text-ink" aria-hidden />
          ) : null}
        </span>
        <span className="hidden text-left text-xs leading-tight xl:block">
          <span className="block text-body">Hi, {user.firstName}</span>
          <span className="flex items-center gap-0.5 font-semibold text-ink">
            My account <ChevronDown className="h-3 w-3" aria-hidden />
          </span>
        </span>
        <span className="sr-only">Account menu for {user.fullName}</span>
      </button>
      {open ? (
        <div role="menu" className="absolute right-0 z-50 mt-2 w-64 rounded-lg border border-line bg-white p-2 shadow-menu">
          <div className="border-b border-line px-3 pt-2 pb-3">
            <p className="text-sm font-semibold text-ink">{user.fullName}</p>
            {user.companyName ? <p className="text-xs text-body">{user.companyName}</p> : null}
            {user.accountType === "contractor" ? (
              <p
                className={cn(
                  "mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.6875rem] font-bold",
                  user.contractorStatus === "approved" && "bg-ink text-gold",
                  user.contractorStatus === "pending" && "bg-warning-soft text-warning",
                  user.contractorStatus === "rejected" && "bg-danger-soft text-danger",
                )}
              >
                <HardHat className="h-3 w-3" aria-hidden />
                {user.contractorStatus === "approved" ? "Contractor pricing active" : user.contractorStatus === "pending" ? "Contractor application pending" : "Contractor application not approved"}
              </p>
            ) : null}
          </div>
          <ul className="py-1">
            {items.map((item) => (
              <li key={item.href}>
                <Link href={item.href} role="menuitem" onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-ink hover:bg-mist">
                  <item.icon className="h-4 w-4 text-body" aria-hidden /> {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <form action={logoutAction} className="border-t border-line pt-1">
            <button type="submit" role="menuitem" className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-ink hover:bg-mist">
              <LogOut className="h-4 w-4 text-body" aria-hidden /> Sign out
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
