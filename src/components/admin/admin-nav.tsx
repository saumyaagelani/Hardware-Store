"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BarChart3,
  ClipboardList,
  FileText,
  FolderTree,
  HardHat,
  Image as ImageIcon,
  LayoutDashboard,
  Layers,
  Mail,
  Megaphone,
  Menu,
  MessageSquare,
  Package,
  PenSquare,
  ShieldCheck,
  Store,
  Tags,
  Truck,
  Users,
  Warehouse,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";

export interface AdminCounts {
  applications: number;
  quotes: number;
  messages: number;
  orders: number;
  lowStock: number;
}

const groups = (c: AdminCounts) => [
  { title: null, items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }] },
  {
    title: "Catalogue",
    items: [
      { href: "/admin/products", label: "Products", icon: Package },
      { href: "/admin/categories", label: "Categories", icon: FolderTree },
      { href: "/admin/variations", label: "Product variations", icon: Layers },
      { href: "/admin/media", label: "Images & documents", icon: ImageIcon },
      { href: "/admin/pricing", label: "Pricing", icon: Tags },
      { href: "/admin/inventory", label: "Inventory", icon: Warehouse, badge: c.lowStock },
    ],
  },
  {
    title: "Sales",
    items: [
      { href: "/admin/orders", label: "Orders", icon: ClipboardList, badge: c.orders },
      { href: "/admin/quotes", label: "Quote requests", icon: FileText, badge: c.quotes },
    ],
  },
  {
    title: "Customers",
    items: [
      { href: "/admin/customers", label: "Customers", icon: Users },
      { href: "/admin/contractors", label: "Contractor applications", icon: HardHat, badge: c.applications },
      { href: "/admin/messages", label: "Contact submissions", icon: MessageSquare, badge: c.messages },
    ],
  },
  {
    title: "Fulfilment",
    items: [
      { href: "/admin/delivery", label: "Delivery settings", icon: Truck },
      { href: "/admin/pickup", label: "Pickup settings", icon: Store },
    ],
  },
  {
    title: "Marketing & content",
    items: [
      { href: "/admin/promotions", label: "Promotional banners", icon: Megaphone },
      { href: "/admin/content", label: "Website content", icon: PenSquare },
    ],
  },
  {
    title: "System",
    items: [
      { href: "/admin/emails", label: "Email notifications", icon: Mail },
      { href: "/admin/staff", label: "Staff & permissions", icon: ShieldCheck },
      { href: "/admin/integrations", label: "Integrations", icon: BarChart3 },
    ],
  },
];

function NavList({ counts, onNavigate }: { counts: AdminCounts; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin" className="space-y-5">
      {groups(counts).map((g, i) => (
        <div key={g.title ?? i}>
          {g.title ? <p className="mb-1.5 px-3 font-display text-[0.6875rem] font-bold tracking-[0.14em] text-muted uppercase">{g.title}</p> : null}
          <ul className="space-y-0.5">
            {g.items.map(({ href, label, icon: Icon, ...rest }) => {
              const badge = "badge" in rest ? (rest.badge as number) : 0;
              const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn("flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors", active ? "bg-gold font-semibold text-ink" : "text-white/75 hover:bg-ink-soft hover:text-white")}
                  >
                    <Icon className="h-4.5 w-4.5 shrink-0" aria-hidden />
                    <span className="flex-1">{label}</span>
                    {badge ? <span className={cn("rounded-full px-1.5 py-px text-[0.6875rem] font-bold", active ? "bg-ink text-gold" : "bg-gold text-ink")}>{badge}</span> : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function AdminSidebar({ counts }: { counts: AdminCounts }) {
  return (
    <aside className="scrollbar-none sticky top-0 hidden h-dvh w-64 shrink-0 overflow-y-auto bg-ink px-3 py-5 lg:block">
      <Link href="/admin" className="mb-6 flex items-center gap-2.5 px-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-gold font-display font-extrabold text-ink">N</span>
        <span className="leading-tight">
          <span className="block font-display text-base font-bold text-white">Northline Admin</span>
          <span className="block text-[0.6875rem] text-muted">Store management</span>
        </span>
      </Link>
      <NavList counts={counts} />
    </aside>
  );
}

export function AdminMobileNav({ counts }: { counts: AdminCounts }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  // eslint-disable-next-line react-hooks/set-state-in-effect -- close on navigation
  useEffect(() => setOpen(false), [pathname]);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="rounded-md p-2 text-ink hover:bg-mist lg:hidden" aria-label="Open admin menu">
        <Menu className="h-5 w-5" aria-hidden />
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Admin menu">
          <div className="absolute inset-0 bg-ink/60" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 overflow-y-auto bg-ink px-3 py-5">
            <div className="mb-5 flex items-center justify-between px-3">
              <span className="font-display text-base font-bold text-white">Northline Admin</span>
              <button type="button" onClick={() => setOpen(false)} className="rounded p-1 text-white/70 hover:text-white" aria-label="Close admin menu">
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <NavList counts={counts} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      ) : null}
    </>
  );
}
