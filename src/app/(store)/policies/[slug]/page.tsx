import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { getDb } from "@/server/db";
import { formatMoney } from "@/lib/format";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { business } from "@/config/business";

/**
 * Policy pages are PLACEHOLDERS — the client will supply final wording.
 * They exist so navigation works and the information architecture is complete.
 */
const policies: Record<string, { title: string; intro: string; sections: { h: string; p: string[] }[] }> = {
  delivery: {
    title: "Delivery & Pickup",
    intro: "How local delivery and in-store pickup work.",
    sections: [
      { h: "In-store pickup", p: ["Pickup is always free. Most in-stock orders are ready within two business hours; you'll receive an email when your order is ready.", "Bring your order number. Our team will help load larger items."] },
      { h: "Local delivery", p: ["Delivery fees are based on your postal code. Enter it at checkout to see your fee."] },
      { h: "Oversized and large orders", p: ["For oversized items or unusually large orders, our team will confirm the delivery fee before dispatch. You won't be charged delivery until it's confirmed."] },
      { h: "Preferred delivery dates", p: ["You can request a preferred date at checkout. Requested dates are subject to confirmation based on stock and route availability."] },
    ],
  },
  returns: {
    title: "Returns & Exchanges",
    intro: "Placeholder returns policy — final terms to be supplied by the business.",
    sections: [
      { h: "Returnable items", p: ["Unopened, resaleable items in original packaging may be returned within a set period with proof of purchase (period to be confirmed)."] },
      { h: "Non-returnable items", p: ["Special-order and custom items, cut products and opened flooring boxes may not be returnable (to be confirmed)."] },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    intro: "Placeholder privacy policy — to be finalised with the business before launch.",
    sections: [
      { h: "Information we collect", p: ["Contact details, addresses and order information you provide when you create an account, place an order, request a quote or contact us.", "Files you upload with quote requests are used only to prepare your quote."] },
      { h: "How we use it", p: ["To process orders and quotes, communicate with you, and — if you opt in — send marketing emails."] },
    ],
  },
  terms: {
    title: "Terms & Conditions",
    intro: "Placeholder terms — to be finalised with the business before launch.",
    sections: [{ h: "Pricing", p: ["Prices are in Canadian dollars. Contractor pricing is available to approved trade accounts only. Sale prices apply while stock lasts."] }],
  },
};

export async function generateMetadata({ params }: PageProps<"/policies/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return { title: policies[slug]?.title ?? "Policy" };
}

export default async function PolicyPage({ params }: PageProps<"/policies/[slug]">) {
  const { slug } = await params;
  const policy = policies[slug];
  if (!policy) notFound();
  const zones = getDb().settings.deliveryZones.filter((z) => z.active);
  return (
    <div className="container-page max-w-3xl py-6 lg:py-10">
      <Breadcrumbs items={[{ label: policy.title }]} />
      <h1 className="mt-5 text-3xl font-extrabold text-ink sm:text-4xl">{policy.title}</h1>
      <p className="mt-2 text-body">{policy.intro}</p>
      <p className="mt-5 flex gap-2 rounded-md border border-dashed border-gold-dark bg-gold-soft p-3 text-sm text-ink">
        <AlertTriangle className="h-4.5 w-4.5 shrink-0" aria-hidden /> Prototype placeholder content — {business.name} will provide final policy wording.
      </p>
      <div className="prose-store mt-6">
        {policy.sections.map((s) => (
          <section key={s.h}>
            <h2>{s.h}</h2>
            {s.p.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </section>
        ))}
        {slug === "delivery" ? (
          <section>
            <h2>Current delivery zones</h2>
            <ul>
              {zones.map((z) => (
                <li key={z.id}>
                  <strong>{z.name}</strong> — {formatMoney(z.fee)} · {z.leadTime}
                  {z.freeOver ? ` · free over ${formatMoney(z.freeOver)}` : ""}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </div>
  );
}
