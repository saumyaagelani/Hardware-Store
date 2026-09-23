import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";

export function PageHeader({ title, description, actions }: { title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">{title}</h1>
        {description ? <p className="mt-1 text-sm text-body">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function Panel({ title, action, children, className, bodyClassName }: { title?: string; action?: { href: string; label: string }; children: ReactNode; className?: string; bodyClassName?: string }) {
  return (
    <section className={cn("min-w-0 rounded-lg border border-line bg-white", className)}>
      {title ? (
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          <h2 className="font-display text-lg font-bold text-ink">{title}</h2>
          {action ? (
            <Link href={action.href} className="inline-flex items-center gap-1 text-sm font-semibold text-ink hover:text-gold-dark">
              {action.label} <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          ) : null}
        </div>
      ) : null}
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

export function StatCard({ label, value, hint, icon }: { label: string; value: ReactNode; hint?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="rounded-lg border border-line bg-white p-5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-body">{label}</p>
        {icon ? <span className="text-muted">{icon}</span> : null}
      </div>
      <p className="mt-2 font-display text-3xl font-bold text-ink">{value}</p>
      {hint ? <p className="mt-1 text-xs text-body">{hint}</p> : null}
    </div>
  );
}
