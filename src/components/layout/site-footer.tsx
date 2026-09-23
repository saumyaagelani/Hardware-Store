import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { business, formattedAddress } from "@/config/business";
import { footerNav } from "@/config/site";
import { Logo } from "./logo";
import { NewsletterForm } from "./newsletter-form";
import { PaymentIcons } from "./payment-icons";

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h2 className="mb-4 font-display text-sm font-bold tracking-[0.14em] text-white uppercase">{title}</h2>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-sm text-white/70 hover:text-gold">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialIcon({ label, href, path }: { label: string; href: string; path: string }) {
  return (
    <a href={href} aria-label={`${label} (link to be added)`} className="flex h-9 w-9 items-center justify-center rounded-md bg-ink-soft text-white/80 hover:bg-gold hover:text-ink">
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
        <path d={path} />
      </svg>
    </a>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-ink text-white">
      <div className="border-b border-ink-line">
        <div className="container-page flex flex-col items-start justify-between gap-6 py-10 lg:flex-row lg:items-center">
          <div>
            <p className="font-display text-2xl font-bold">Get deals & new-product news</p>
            <p className="mt-1 text-sm text-white/70">Occasional emails only. Unsubscribe anytime.</p>
          </div>
          <div className="w-full max-w-md">
            <NewsletterForm />
          </div>
        </div>
      </div>

      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo tone="light" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70">{business.tagline} Serving homeowners and trade professionals with in-store pickup and local delivery.</p>
          <ul className="mt-6 space-y-3 text-sm text-white/80">
            <li className="flex gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
              <span>{formattedAddress}</span>
            </li>
            <li className="flex gap-2.5">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
              <a href={business.phoneHref} className="hover:text-gold">
                {business.phone}
              </a>
            </li>
            <li className="flex gap-2.5">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
              <a href={`mailto:${business.email}`} className="hover:text-gold">
                {business.email}
              </a>
            </li>
            <li className="flex gap-2.5">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
              <span>
                {business.hours.map((h) => (
                  <span key={h.days} className="block">
                    {h.days}: {h.time}
                  </span>
                ))}
              </span>
            </li>
          </ul>
        </div>
        <FooterColumn title="Shop" links={footerNav.shop} />
        <FooterColumn title="Customer Service" links={footerNav.service} />
        <div>
          <FooterColumn title="Trade & Business" links={footerNav.business} />
          <div className="mt-8 flex gap-2">
            <SocialIcon label="Facebook" href={business.social.facebook} path="M14 8h3V4h-3c-2.8 0-4.5 1.8-4.5 4.6V11H7v4h2.5v7h4v-7H16l.5-4h-3V8.8c0-.5.3-.8.5-.8Z" />
            <SocialIcon label="Instagram" href={business.social.instagram} path="M12 7.3A4.7 4.7 0 1 0 12 16.7 4.7 4.7 0 0 0 12 7.3Zm0 7.7a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm4.9-7.9a1.1 1.1 0 1 1 0-2.2 1.1 1.1 0 0 1 0 2.2ZM12 4c2.2 0 2.4 0 3.3.1 2.2.1 3.2 1.1 3.3 3.3.1.9.1 1.1.1 3.3v2.6c0 2.2 0 2.4-.1 3.3-.1 2.2-1.1 3.2-3.3 3.3-.9.1-1.1.1-3.3.1s-2.4 0-3.3-.1c-2.2-.1-3.2-1.1-3.3-3.3-.1-.9-.1-1.1-.1-3.3v-2.6c0-2.2 0-2.4.1-3.3.1-2.2 1.1-3.2 3.3-3.3C9.6 4 9.8 4 12 4Zm0-1.6c-2.3 0-2.5 0-3.4.1-3 .1-4.6 1.8-4.8 4.8-.1.9-.1 1.1-.1 3.4v2.6c0 2.3 0 2.5.1 3.4.1 3 1.8 4.6 4.8 4.8.9.1 1.1.1 3.4.1s2.5 0 3.4-.1c3-.1 4.6-1.8 4.8-4.8.1-.9.1-1.1.1-3.4v-2.6c0-2.3 0-2.5-.1-3.4-.1-3-1.8-4.6-4.8-4.8-.9-.1-1.1-.1-3.4-.1Z" />
          </div>
        </div>
      </div>

      <div className="border-t border-ink-line">
        <div className="container-page flex flex-col gap-4 py-6 text-xs text-white/60 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>© {new Date().getFullYear()} {business.name}</span>
            {footerNav.legal.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-white">
                {l.label}
              </Link>
            ))}
            {business.isPlaceholder ? <span className="text-gold/80">Prototype — business details shown are placeholders</span> : null}
          </div>
          <PaymentIcons />
        </div>
      </div>
    </footer>
  );
}
