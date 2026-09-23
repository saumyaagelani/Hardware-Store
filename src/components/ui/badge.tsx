import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { Tone } from "@/lib/status";

const tones: Record<Tone, string> = {
  neutral: "bg-mist text-ink-line",
  info: "bg-info-soft text-info",
  warning: "bg-warning-soft text-warning",
  success: "bg-success-soft text-success",
  danger: "bg-danger-soft text-danger",
  special: "bg-special-soft text-special",
  gold: "bg-gold-soft text-ink",
};

const dots: Record<Tone, string> = {
  neutral: "bg-muted",
  info: "bg-info",
  warning: "bg-warning",
  success: "bg-success",
  danger: "bg-danger",
  special: "bg-special",
  gold: "bg-gold-dark",
};

export function StatusBadge({ tone, children, className, dot = true }: { tone: Tone; children: ReactNode; className?: string; dot?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap", tones[tone], className)}>
      {dot ? <span className={cn("h-1.5 w-1.5 rounded-full", dots[tone])} aria-hidden /> : null}
      {children}
    </span>
  );
}

/** Solid merchandising badge used on product imagery. */
export function ProductFlag({ children, variant = "dark" }: { children: ReactNode; variant?: "dark" | "gold" | "light" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-2 py-1 font-display text-[0.6875rem] font-bold tracking-wider uppercase",
        variant === "gold" && "bg-gold text-ink",
        variant === "dark" && "bg-ink text-white",
        variant === "light" && "bg-white text-ink ring-1 ring-line",
      )}
    >
      {children}
    </span>
  );
}
