import Link from "next/link";
import { ArrowRight, BadgeCheck, FileText, HardHat } from "lucide-react";
import type { SiteContent } from "@/lib/types";
import { ButtonLink } from "@/components/ui/button";

export function Hero({ content }: { content: SiteContent }) {
  return (
    <section className="relative overflow-hidden bg-ink text-white">
      <div aria-hidden className="absolute inset-y-0 right-0 hidden w-1/2 bg-ink-soft lg:block" />
      <div className="container-page relative grid items-center gap-10 py-10 sm:py-14 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:py-20">
        <div>
          <p className="eyebrow text-gold!">{content.heroEyebrow}</p>
          <h1 className="mt-4 max-w-xl text-[2.375rem] leading-[1.05] font-extrabold tracking-tight sm:text-5xl lg:text-[3.5rem]">{content.heroTitle}</h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-white/75 sm:text-lg">{content.heroBody}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/shop" size="lg">
              Shop Products <ArrowRight className="h-5 w-5" aria-hidden />
            </ButtonLink>
            <ButtonLink href="/quote" size="lg" variant="outline-light">
              <FileText className="h-5 w-5" aria-hidden /> Get a Free Quote
            </ButtonLink>
          </div>
          <ul className="mt-9 grid gap-3 text-sm text-white/80 sm:grid-cols-3">
            {["In-store pickup, same day", "Local delivery zones", "Trade pricing for contractors"].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <BadgeCheck className="h-4.5 w-4.5 shrink-0 text-gold" aria-hidden /> {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative">
          <div className="overflow-hidden rounded-lg ring-1 ring-white/10">
            <img src="/media/hero" alt="Illustration of a finished interior with vinyl plank flooring, a fluted wall panel feature wall, a Shaker door and a navy vanity" className="aspect-[3/2] w-full object-cover" fetchPriority="high" />
          </div>
          <Link href="/deals" className="group absolute -bottom-5 left-4 w-60 rounded-lg bg-gold p-4 text-ink shadow-raised sm:left-6 sm:w-64">
            <p className="font-display text-xs font-bold tracking-[0.14em] uppercase">Fall Flooring Event</p>
            <p className="mt-1 font-display text-2xl leading-tight font-extrabold">Up to 20% off vinyl</p>
            <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold">
              Shop deals <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </span>
          </Link>
          <Link href="/contractors" className="absolute -top-4 right-4 hidden items-center gap-3 rounded-lg bg-white p-3 pr-4 text-ink shadow-raised sm:flex">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-ink text-gold">
              <HardHat className="h-5 w-5" aria-hidden />
            </span>
            <span className="text-sm leading-tight">
              <span className="block font-bold">Contractor?</span>
              <span className="block text-body">Unlock trade pricing</span>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
