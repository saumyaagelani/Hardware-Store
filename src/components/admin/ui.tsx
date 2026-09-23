import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function AdminHeader({ title, description, actions, back }: { title: string; description?: ReactNode; actions?: ReactNode; back?: { href: string; label: string } }) {
  return (
    <div className="mb-6">
      {back ? (
        <Link href={back.href} className="mb-2 inline-block text-sm font-medium text-body hover:text-ink">
          ← {back.label}
        </Link>
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold text-ink sm:text-[1.75rem]">{title}</h1>
          {description ? <div className="mt-1 text-sm text-body">{description}</div> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}

export function Table({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("overflow-x-auto rounded-lg border border-line bg-white", className)}>
      <table className="w-full min-w-[640px] text-sm">{children}</table>
    </div>
  );
}

export function Th({ children, className }: { children?: ReactNode; className?: string }) {
  return <th className={cn("bg-canvas px-4 py-3 text-left text-xs font-semibold tracking-wide whitespace-nowrap text-body uppercase", className)}>{children}</th>;
}

export function Td({ children, className }: { children?: ReactNode; className?: string }) {
  return <td className={cn("border-t border-line px-4 py-3 align-middle", className)}>{children}</td>;
}

export function FilterTabs({ tabs, active }: { tabs: { label: string; href: string; key: string; count?: number }[]; active: string }) {
  return (
    <nav aria-label="Filter" className="scrollbar-none mb-4 flex gap-1 overflow-x-auto border-b border-line">
      {tabs.map((t) => (
        <Link
          key={t.key}
          href={t.href}
          aria-current={active === t.key ? "page" : undefined}
          className={cn("-mb-px flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-semibold whitespace-nowrap", active === t.key ? "border-gold text-ink" : "border-transparent text-body hover:text-ink")}
        >
          {t.label}
          {t.count !== undefined ? <span className="rounded-full bg-mist px-1.5 text-xs text-body">{t.count}</span> : null}
        </Link>
      ))}
    </nav>
  );
}
