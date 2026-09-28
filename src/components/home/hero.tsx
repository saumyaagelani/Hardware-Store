import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { SiteContent } from "@/lib/types";
import { buttonClass } from "@/components/ui/button";

/** Splits "First line. Second line." so the last sentence can be highlighted in gold. */
function splitTitle(title: string): [string, string | null] {
  const parts = title.trim().match(/[^.!?]+[.!?]*/g)?.map((p) => p.trim()) ?? [title];
  if (parts.length < 2) return [title, null];
  return [parts.slice(0, -1).join(" "), parts[parts.length - 1]];
}

/**
 * Homepage hero — one full-bleed section split 50/50 on desktop (content | image).
 * Height scales with the viewport width (≈0.56 × width, 640–900px) so it reads as
 * the dominant first-screen section; below `lg` the content and image stack.
 */
export function Hero({ content }: { content: SiteContent }) {
  const [lead, accent] = splitTitle(content.heroTitle);
  return (
    <section className="relative overflow-hidden border-t border-ink-line bg-surface text-white">
      <div className="grid grid-cols-1 lg:min-h-[clamp(640px,56vw,900px)] lg:grid-cols-2">
        {/* Left: content panel. Left edge aligns with the page container. */}
        <div className="flex flex-col px-4 pt-12 pb-10 sm:px-6 sm:pt-16 sm:pb-12 lg:pt-20 lg:pr-12 lg:pb-14 lg:pl-[max(2rem,calc((100vw-1280px)/2+2rem))] xl:pr-20">
          <div className="flex flex-1 items-center">
            <div className="w-full max-w-[40rem]">
              <p className="flex items-center gap-3 font-display text-xs font-semibold tracking-[0.14em] text-white uppercase sm:gap-4 sm:text-sm sm:tracking-[0.18em]">
                <span className="h-0.5 w-8 shrink-0 bg-gold" aria-hidden />
                {content.heroEyebrow}
              </p>
              <h1 className="mt-6 max-w-[10em] text-[2.75rem] sm:text-[3.5rem] lg:text-[clamp(3.25rem,5.4vw,4.875rem)] leading-[1] font-semibold tracking-[-0.035em] sm:mt-8">
                {lead}
                {accent ? <span className="block text-gold">{accent}</span> : null}
              </h1>
              <p className="mt-6 max-w-[34rem] text-base leading-relaxed text-muted sm:mt-8 sm:text-lg">{content.heroBody}</p>
              <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap">
                <Link href="/shop" className={buttonClass("primary", "lg", "rounded-sm px-7")}>
                  Shop products <ArrowUpRight className="h-5 w-5" aria-hidden />
                </Link>
                <Link href="/quote" className={buttonClass("outline-light", "lg", "rounded-sm px-7")}>
                  Get a free quote
                </Link>
              </div>
            </div>
          </div>
          <div className="mt-12 w-full max-w-[34rem] border-t border-ink-line pt-6 lg:mt-16">
            <p className="font-display text-xs font-semibold tracking-[0.16em] text-muted uppercase sm:text-sm">For homeowners &amp; professionals</p>
            <p className="mt-2 text-sm text-white sm:text-base">Canadian projects. Covered.</p>
          </div>
        </div>

        {/* Right: image fills the full height of the right half. */}
        <div className="relative aspect-[4/3] sm:aspect-[16/10] lg:aspect-auto">
          <img
            src="/media/hero"
            alt="Illustration of a finished interior with vinyl plank flooring, a fluted wall panel feature wall, a Shaker door and a navy vanity"
            className="absolute inset-0 h-full w-full object-cover object-[center_65%]"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/45 via-transparent to-transparent" aria-hidden />
          <p className="absolute top-5 left-5 text-sm text-white sm:top-7 sm:left-8 lg:top-9 lg:left-10">A good home starts with a great foundation.</p>
          <Link
            href="/shop/vinyl"
            className="group absolute right-5 bottom-5 left-5 bg-cream p-4 text-inverse shadow-raised sm:right-auto sm:bottom-8 sm:left-8 sm:w-[24rem] sm:p-5 lg:bottom-10 lg:left-10 xl:w-[27rem] xl:p-6"
          >
            <p className="text-[0.625rem] font-medium tracking-[0.12em] whitespace-nowrap text-inverse/70 uppercase sm:text-[0.6875rem] xl:text-xs xl:tracking-[0.16em]">Natural textures. Lasting impressions.</p>
            <p className="mt-2 flex items-center justify-between gap-4 font-display text-xl font-medium sm:text-2xl">
              Explore vinyl flooring
              <ArrowUpRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 sm:h-6 sm:w-6" aria-hidden />
            </p>
          </Link>
        </div>
      </div>
    </section>
  );
}
