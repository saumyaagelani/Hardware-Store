import Link from "next/link";
import { ArrowUpRight, BadgeCheck } from "lucide-react";
import type { SiteContent } from "@/lib/types";
import { buttonClass } from "@/components/ui/button";

/** Splits "First line. Second line." so the last sentence can be highlighted in gold. */
function splitTitle(title: string): [string, string | null] {
  const parts = title.trim().match(/[^.!?]+[.!?]*/g)?.map((p) => p.trim()) ?? [title];
  if (parts.length < 2) return [title, null];
  return [parts.slice(0, -1).join(" "), parts[parts.length - 1]];
}

export function Hero({ content }: { content: SiteContent }) {
  const [lead, accent] = splitTitle(content.heroTitle);
  return (
    <section className="relative overflow-hidden border-t border-ink-line bg-surface text-white">
      <div className="grid grid-cols-1 lg:min-h-[640px] lg:grid-cols-[1.02fr_1fr]">
        <div className="flex items-center px-4 py-12 sm:px-6 sm:py-16 lg:py-20 lg:pr-14 lg:pl-[max(2rem,calc((100vw-1280px)/2+2rem))]">
          <div className="max-w-xl">
            <p className="flex items-center gap-3 font-display text-xs font-semibold tracking-[0.14em] text-white uppercase sm:gap-4 sm:text-sm sm:tracking-[0.18em]">
              <span className="h-px w-8 bg-muted" aria-hidden />
              {content.heroEyebrow}
            </p>
            <h1 className="mt-7 text-[2.75rem] leading-[1.02] font-semibold tracking-[-0.03em] sm:text-6xl lg:text-[4.25rem]">
              {lead}
              {accent ? <span className="block text-gold">{accent}</span> : null}
            </h1>
            <p className="mt-7 max-w-lg text-base leading-relaxed text-muted sm:text-lg">{content.heroBody}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/shop" className={buttonClass("primary", "lg", "rounded-sm px-7")}>
                Shop products <ArrowUpRight className="h-5 w-5" aria-hidden />
              </Link>
              <Link href="/quote" className={buttonClass("outline-light", "lg", "rounded-sm px-7")}>
                Get a free quote
              </Link>
            </div>
            <ul className="mt-10 grid grid-cols-1 gap-3 border-t border-ink-line pt-7 text-sm text-mist sm:grid-cols-3">
              {["In-store pickup, same day", "Local delivery zones", "Trade pricing for contractors"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <BadgeCheck className="h-4.5 w-4.5 shrink-0 text-gold" aria-hidden /> {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="relative min-h-[320px] sm:min-h-[420px] lg:min-h-0">
          <img
            src="/media/hero"
            alt="Illustration of a finished interior with vinyl plank flooring, a fluted wall panel feature wall, a Shaker door and a navy vanity"
            className="absolute inset-0 h-full w-full object-cover"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/45 via-transparent to-transparent" aria-hidden />
          <p className="absolute top-5 left-5 text-sm text-white sm:top-7 sm:left-8">A good home starts with a great foundation.</p>
          <Link href="/shop/vinyl" className="group absolute right-5 bottom-5 left-5 bg-cream p-5 text-inverse shadow-raised sm:right-auto sm:bottom-8 sm:left-8 sm:w-[26rem] sm:p-6">
            <p className="text-xs font-medium tracking-[0.16em] text-inverse/70 uppercase">Natural textures. Lasting impressions.</p>
            <p className="mt-2 flex items-center justify-between gap-4 font-display text-2xl font-medium sm:text-[1.75rem]">
              Explore vinyl flooring
              <ArrowUpRight className="h-6 w-6 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
            </p>
          </Link>
        </div>
      </div>
    </section>
  );
}
