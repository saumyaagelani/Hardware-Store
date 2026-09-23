import type { Metadata } from "next";
import Link from "next/link";
import { Clock, FileText, Mail, MapPin, MessageSquare, Phone } from "lucide-react";
import { getCurrentUser } from "@/server/auth/session";
import { business, formattedAddress } from "@/config/business";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ContactForm } from "@/components/forms/contact-form";
import { MapPlaceholder } from "@/components/ui/map-placeholder";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Visit our showroom, call, email or send us a message.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const user = await getCurrentUser();
  return (
    <div className="container-page py-6 lg:py-8">
      <Breadcrumbs items={[{ label: "Contact" }]} />
      <div className="mt-5 mb-8 max-w-2xl">
        <h1 className="text-3xl font-extrabold text-ink sm:text-4xl">Contact us</h1>
        <p className="mt-2 text-body">Questions about a product, an order or a project? Our team is happy to help.</p>
      </div>
      <div className="grid gap-8 lg:grid-cols-[1fr_1.3fr]">
        <div className="space-y-4">
          {[
            { icon: MapPin, title: "Showroom & warehouse", body: formattedAddress },
            { icon: Phone, title: "Phone", body: <a href={business.phoneHref} className="font-semibold text-ink hover:underline">{business.phone}</a> },
            { icon: MessageSquare, title: "Text", body: business.textNumber },
            { icon: Mail, title: "Email", body: <a href={`mailto:${business.email}`} className="font-semibold text-ink hover:underline">{business.email}</a> },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex gap-4 rounded-lg border border-line p-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-gold-soft text-ink">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <div className="text-sm">
                <p className="font-semibold text-ink">{title}</p>
                <div className="mt-0.5 text-body">{body}</div>
              </div>
            </div>
          ))}
          <div className="flex gap-4 rounded-lg border border-line p-5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-gold-soft text-ink">
              <Clock className="h-5 w-5" aria-hidden />
            </span>
            <div className="flex-1 text-sm">
              <p className="font-semibold text-ink">Opening hours</p>
              <dl className="mt-1 space-y-0.5">
                {business.hours.map((h) => (
                  <div key={h.days} className="flex justify-between gap-4">
                    <dt className="text-body">{h.days}</dt>
                    <dd className="font-medium text-ink">{h.time}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
          <p className="text-xs text-body">Address, phone numbers and hours shown are placeholders until confirmed by the business.</p>
        </div>
        <div className="space-y-6">
          <div className="rounded-lg border border-line bg-white p-6 sm:p-8">
            <h2 className="mb-5 font-display text-2xl font-bold text-ink">Send us a message</h2>
            <ContactForm initial={{ name: user?.fullName ?? "", email: user?.email ?? "", phone: user?.phone ?? "" }} />
          </div>
          <Link href="/quote" className="flex items-center gap-4 rounded-lg bg-ink p-5 text-white hover:bg-ink-soft">
            <FileText className="h-7 w-7 shrink-0 text-gold" aria-hidden />
            <span>
              <span className="block font-display text-lg font-bold">Need pricing for a project?</span>
              <span className="text-sm text-white/70">Use our free quote form to upload plans and photos.</span>
            </span>
          </Link>
        </div>
      </div>
      <div className="mt-10 overflow-hidden rounded-lg border border-line">
        <MapPlaceholder className="h-80" />
      </div>
    </div>
  );
}
