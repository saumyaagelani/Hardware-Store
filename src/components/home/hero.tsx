import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowUpRight } from "lucide-react";
import type { SiteContent } from "@/lib/types";

/** Splits "First line. Second line." so the last sentence can be highlighted in gold. */
function splitTitle(title: string): [string, string | null] {
  const parts = title.trim().match(/[^.!?]+[.!?]*/g)?.map((p) => p.trim()) ?? [title];
  if (parts.length < 2) return [title, null];
  return [parts.slice(0, -1).join(" "), parts[parts.length - 1]];
}

/*
 * Desktop (lg+) geometry is taken from the client's 1600 × 900 target mock-up.
 * `--u` is one target pixel: exactly 1px at 1600px wide, scaling with the
 * viewport (0.64px at 1024 → 1.2px at 1920). Every lg: size below is
 * "target px × --u", so the hero keeps the mock-up's proportions at any
 * desktop width. Below lg the hero stacks with ordinary responsive sizes.
 */
const heroScale = { "--u": "clamp(0.64px, 0.0625vw, 1.2px)" } as CSSProperties;

export function Hero({ content }: { content: SiteContent }) {
  const [lead, accent] = splitTitle(content.heroTitle);
  return (
    <section className="relative overflow-hidden border-t border-ink-line bg-surface text-white" style={heroScale}>
      <div className="grid grid-cols-1 lg:min-h-[calc(900*var(--u))] lg:grid-cols-[52.75fr_47.25fr]">
        {/* Left: content panel */}
        <div className="flex flex-col px-4 pt-12 pb-10 sm:px-6 sm:pt-16 sm:pb-12 lg:pt-[calc(159*var(--u))] lg:pr-[calc(41*var(--u))] lg:pb-[calc(110*var(--u))] lg:pl-[calc(84*var(--u))]">
          <p className="flex items-center gap-3 font-sans text-xs leading-none font-semibold tracking-[0.12em] text-white uppercase sm:text-sm lg:-ml-[calc(6*var(--u))] lg:gap-[calc(21*var(--u))] lg:text-[max(12px,calc(20.5*var(--u)))]">
            <span className="h-0.5 w-8 shrink-0 bg-gold lg:h-[max(1.5px,calc(2*var(--u)))] lg:w-[calc(44*var(--u))]" aria-hidden />
            {content.heroEyebrow}
          </p>

          <h1 className="mt-6 max-w-[10em] font-sans text-[2.625rem] leading-[0.98] font-medium tracking-[-0.035em] sm:mt-8 sm:text-[3.5rem] lg:mt-[calc(47*var(--u))] lg:-ml-[calc(3*var(--u))] lg:text-[calc(82*var(--u))] lg:leading-[calc(80.5*var(--u))]">
            <span className="block">{lead}</span>
            {accent ? <span className="block text-gold">{accent}</span> : null}
          </h1>

          <p className="mt-5 max-w-[36rem] text-base leading-relaxed text-muted sm:mt-7 sm:text-lg lg:mt-[calc(32*var(--u))] lg:max-w-[calc(720*var(--u))] lg:text-[max(16px,calc(22*var(--u)))] lg:leading-[max(24px,calc(34*var(--u)))]">
            {content.heroBody}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row lg:mt-[calc(41*var(--u))] lg:ml-[calc(7*var(--u))] lg:gap-[calc(21*var(--u))]">
            <Link
              href="/shop"
              className="inline-flex h-12 items-center justify-center gap-3 rounded-[3px] border border-gold bg-gold px-6 text-base font-medium text-ink transition-opacity hover:opacity-90 lg:h-[max(44px,calc(62*var(--u)))] lg:gap-[calc(16*var(--u))] lg:px-[calc(31*var(--u))] lg:text-[max(15px,calc(21*var(--u)))]"
            >
              Shop products <ArrowUpRight className="h-5 w-5 lg:h-[max(18px,calc(24*var(--u)))] lg:w-[max(18px,calc(24*var(--u)))]" aria-hidden />
            </Link>
            <Link
              href="/quote"
              className="inline-flex h-12 items-center justify-center rounded-[3px] border border-stone/45 px-6 text-base font-medium text-white transition-colors hover:border-white hover:bg-white/5 lg:h-[max(44px,calc(62*var(--u)))] lg:px-[calc(31*var(--u))] lg:text-[max(15px,calc(21*var(--u)))]"
            >
              Get a free quote
            </Link>
          </div>

          <div className="mt-10 flex flex-col gap-1.5 border-t border-ink-line pt-6 sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-6 sm:gap-y-1.5 lg:mt-[calc(53*var(--u))] lg:gap-x-[calc(25*var(--u))] lg:pt-[calc(38*var(--u))]">
            <p className="text-xs font-semibold tracking-[0.08em] whitespace-nowrap text-white uppercase sm:text-sm lg:text-[max(12px,calc(18*var(--u)))] lg:leading-[1.2]">For homeowners &amp; professionals</p>
            <p className="text-sm whitespace-nowrap text-muted sm:text-base lg:text-[max(13px,calc(19*var(--u)))] lg:leading-[1.2]">Canadian projects. Covered.</p>
          </div>
        </div>

        {/* Right: image fills the full height of the right half */}
        <div className="relative aspect-[4/3] sm:aspect-[16/10] lg:aspect-auto">
          <img
            src="/media/hero"
            alt="Illustration of a finished interior with vinyl plank flooring, a fluted wall panel feature wall, a Shaker door and a navy vanity"
            className="absolute inset-0 h-full w-full object-cover object-[center_60%]"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-transparent to-transparent" aria-hidden />
          <p className="absolute top-5 left-5 text-sm text-white sm:top-7 sm:left-8 lg:top-[calc(71*var(--u))] lg:left-[calc(46*var(--u))] lg:text-[max(13px,calc(19*var(--u)))] lg:leading-[1.3]">
            A good home starts with a great foundation.
          </p>
          <Link
            href="/shop/vinyl"
            className="group absolute right-5 bottom-5 left-5 bg-cream px-5 pt-4 pb-5 text-inverse shadow-raised sm:right-auto sm:bottom-8 sm:left-8 sm:w-[26rem] lg:bottom-[calc(102*var(--u))] lg:left-[calc(46*var(--u))] lg:w-[calc(562*var(--u))] lg:pt-[calc(28*var(--u))] lg:pr-[calc(34*var(--u))] lg:pb-[calc(30*var(--u))] lg:pl-[calc(34*var(--u))]"
          >
            <p className="text-[0.625rem] leading-none font-medium tracking-[0.14em] whitespace-nowrap text-inverse/70 uppercase sm:text-[0.6875rem] lg:text-[max(10px,calc(16*var(--u)))]">
              Natural textures. Lasting impressions.
            </p>
            <p className="mt-3 flex items-center justify-between gap-4 text-xl leading-[1.1] font-normal tracking-[-0.01em] sm:text-2xl lg:mt-[calc(14*var(--u))] lg:text-[max(20px,calc(36*var(--u)))]">
              Explore vinyl flooring
              <ArrowUpRight
                className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 sm:h-6 sm:w-6 lg:h-[max(20px,calc(28*var(--u)))] lg:w-[max(20px,calc(28*var(--u)))]"
                aria-hidden
              />
            </p>
          </Link>
        </div>
      </div>
    </section>
  );
}
