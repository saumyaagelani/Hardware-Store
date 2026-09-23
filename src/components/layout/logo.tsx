import Link from "next/link";
import { business } from "@/config/business";
import { cn } from "@/lib/cn";

/** Placeholder logo — swap for the client's final logo file when supplied. */
export function Logo({ tone = "dark", className }: { tone?: "dark" | "light"; className?: string }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2.5", className)} aria-label={`${business.name} — home`}>
      <svg viewBox="0 0 40 40" className="h-9 w-9 shrink-0 sm:h-10 sm:w-10" aria-hidden>
        <rect width="40" height="40" rx="6" fill="#F5B82E" />
        <path d="M8 19 20 9l12 10" fill="none" stroke="#111827" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13 31V20l14 11V20" fill="none" stroke="#111827" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="flex flex-col leading-none">
        <span className={cn("font-display text-[1.25rem] font-extrabold tracking-tight uppercase sm:text-[1.375rem]", tone === "dark" ? "text-ink" : "text-white")}>
          {business.shortName}
        </span>
        <span className={cn("mt-0.5 font-display text-[0.625rem] font-semibold tracking-[0.22em] uppercase", tone === "dark" ? "text-body" : "text-muted")}>
          Building Supply
        </span>
      </span>
    </Link>
  );
}
