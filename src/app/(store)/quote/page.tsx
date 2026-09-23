import type { Metadata } from "next";
import { Clock, FileCheck2, Phone, ShieldCheck } from "lucide-react";
import { getCurrentUser } from "@/server/auth/session";
import { getProductBySlug } from "@/server/services/catalog";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { QuoteForm, type QuotePrefill, type QuoteProductPrefill } from "@/components/forms/quote-form";
import { business } from "@/config/business";

export const metadata: Metadata = {
  title: "Free Quote",
  description: "Request a free, itemised quote for flooring, doors, bathroom and plumbing supplies. Upload photos, measurements or floor plans.",
  alternates: { canonical: "/quote" },
};

export default async function QuotePage({ searchParams }: PageProps<"/quote">) {
  const params = await searchParams;
  const one = (k: string) => (Array.isArray(params[k]) ? params[k]?.[0] : params[k]) as string | undefined;
  const user = await getCurrentUser();
  const fromCart = one("from") === "cart";
  const found = one("product") ? getProductBySlug(one("product")!) : undefined;
  const product: QuoteProductPrefill | undefined = found
    ? { id: found.id, name: found.name, sku: found.sku, slug: found.slug, image: found.images[0]?.src, optionsLabel: one("options")?.slice(0, 200), quantity: one("qty")?.slice(0, 10) ?? "1" }
    : undefined;
  const addr = user?.deliveryAddresses[0] ?? user?.billingAddress;
  const prefill: QuotePrefill = {
    fullName: user?.fullName ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    companyName: user?.companyName ?? "",
    projectAddress: addr ? `${addr.line1}, ${addr.city}, ${addr.province}` : "",
    customerType: one("type") === "contractor" || user?.accountType === "contractor" ? "contractor" : "homeowner",
    preferredContact: user?.preferredContact ?? "email",
    signedIn: Boolean(user),
  };

  return (
    <div className="bg-canvas">
      <div className="container-page py-6 lg:py-8">
        <Breadcrumbs items={[{ label: "Free Quote" }]} />
        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_340px] lg:gap-10">
          <div className="rounded-lg border border-line bg-white p-5 sm:p-8">
            <p className="eyebrow">Free quote</p>
            <h1 className="mt-2 text-3xl font-extrabold text-ink sm:text-4xl">{fromCart ? "Request a quote for your cart" : "Tell us about your project"}</h1>
            <p className="mt-2 mb-8 max-w-2xl text-body">
              {fromCart
                ? "We've added the items from your cart. Add any missing project details and we'll send an itemised quote — your cart stays saved."
                : "Share what you need and we'll prepare an itemised quote with pricing, availability and delivery options."}
            </p>
            <QuoteForm prefill={prefill} product={product} fromCart={fromCart} initialProducts={one("products")?.slice(0, 200)} />
          </div>
          <aside className="h-fit space-y-4 lg:sticky lg:top-6">
            <div className="rounded-lg bg-ink p-6 text-white">
              <h2 className="font-display text-xl font-bold">What happens next?</h2>
              <ol className="mt-4 space-y-4 text-sm">
                {[
                  { icon: FileCheck2, t: "You'll get a reference number", d: "Instantly, plus a confirmation email." },
                  { icon: Clock, t: "We review your project", d: "Usually within one business day." },
                  { icon: Phone, t: "We send your quote", d: "By your preferred contact method." },
                ].map(({ icon: Icon, t, d }) => (
                  <li key={t} className="flex gap-3">
                    <Icon className="mt-0.5 h-5 w-5 shrink-0 text-gold" aria-hidden />
                    <span>
                      <span className="block font-semibold">{t}</span>
                      <span className="text-white/70">{d}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="rounded-lg border border-line bg-white p-5 text-sm">
              <p className="flex items-center gap-2 font-semibold text-ink">
                <ShieldCheck className="h-4.5 w-4.5 text-success" aria-hidden /> No obligation
              </p>
              <p className="mt-1 text-body">Quotes are free and there&apos;s no commitment to buy.</p>
              <p className="mt-4 font-semibold text-ink">Prefer to talk?</p>
              <a href={business.phoneHref} className="mt-1 block font-display text-lg font-bold text-ink">
                {business.phone}
              </a>
              <p className="text-body">{business.quoteEmail}</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
