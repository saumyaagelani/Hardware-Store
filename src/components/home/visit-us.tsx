import { Clock, MapPin, Phone } from "lucide-react";
import { business, formattedAddress } from "@/config/business";
import { ButtonLink } from "@/components/ui/button";
import { MapPlaceholder } from "@/components/ui/map-placeholder";

export function VisitUs() {
  return (
    <div className="grid overflow-hidden rounded-lg border border-line bg-white lg:grid-cols-[1fr_1.3fr]">
      <div className="p-6 sm:p-10">
        <p className="eyebrow">Visit the showroom</p>
        <h2 className="mt-3 text-3xl leading-tight font-extrabold text-ink">See it, touch it, take it home.</h2>
        <p className="mt-3 text-body">Browse flooring samples, door styles and vanity finishes in person, and talk to our team about your project.</p>
        <ul className="mt-6 space-y-4 text-sm">
          <li className="flex gap-3">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-gold-dark" aria-hidden />
            <span className="text-ink">{formattedAddress}</span>
          </li>
          <li className="flex gap-3">
            <Clock className="mt-0.5 h-5 w-5 shrink-0 text-gold-dark" aria-hidden />
            <span className="text-ink">
              {business.hours.map((h) => (
                <span key={h.days} className="flex justify-between gap-6">
                  <span className="text-body">{h.days}</span>
                  <span className="font-medium">{h.time}</span>
                </span>
              ))}
            </span>
          </li>
          <li className="flex gap-3">
            <Phone className="mt-0.5 h-5 w-5 shrink-0 text-gold-dark" aria-hidden />
            <a href={business.phoneHref} className="font-semibold text-ink hover:underline">
              {business.phone}
            </a>
          </li>
        </ul>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/contact" variant="dark">
            Contact us
          </ButtonLink>
          <ButtonLink href="/quote" variant="outline">
            Get a quote
          </ButtonLink>
        </div>
      </div>
      <MapPlaceholder className="min-h-72" />
    </div>
  );
}
