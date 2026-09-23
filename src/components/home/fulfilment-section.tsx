import Link from "next/link";
import { ArrowRight, CalendarClock, MapPin, PackageCheck, Truck } from "lucide-react";
import type { StoreSettings } from "@/lib/types";
import { formatMoney } from "@/lib/format";

export function FulfilmentSection({ settings }: { settings: StoreSettings }) {
  const pickup = settings.pickupLocations.filter((l) => l.active);
  const zones = settings.deliveryZones.filter((z) => z.active);
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="rounded-lg border border-line bg-white p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-md bg-gold-soft text-ink">
            <PackageCheck className="h-5.5 w-5.5" aria-hidden />
          </span>
          <div>
            <h3 className="font-display text-xl font-bold text-ink">Free in-store pickup</h3>
            <p className="text-sm text-body">Order online, collect when it suits you.</p>
          </div>
        </div>
        <ul className="mt-6 divide-y divide-line">
          {pickup.map((l) => (
            <li key={l.id} className="flex gap-3 py-3.5">
              <MapPin className="mt-0.5 h-4.5 w-4.5 shrink-0 text-gold-dark" aria-hidden />
              <div className="text-sm">
                <p className="font-semibold text-ink">{l.name}</p>
                <p className="text-body">{l.hours}</p>
                <p className="mt-1 text-xs font-semibold text-success">Ready: {l.readyTime}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-lg border border-line bg-white p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-md bg-gold-soft text-ink">
            <Truck className="h-5.5 w-5.5" aria-hidden />
          </span>
          <div>
            <h3 className="font-display text-xl font-bold text-ink">Local delivery</h3>
            <p className="text-sm text-body">Enter your postal code at checkout to see your fee.</p>
          </div>
        </div>
        <ul className="mt-6 divide-y divide-line">
          {zones.map((z) => (
            <li key={z.id} className="flex items-center justify-between gap-4 py-3.5 text-sm">
              <div>
                <p className="font-semibold text-ink">{z.name}</p>
                <p className="text-body">{z.leadTime}{z.freeOver ? ` · Free over ${formatMoney(z.freeOver)}` : ""}</p>
              </div>
              <span className="font-display text-lg font-bold text-ink">{formatMoney(z.fee)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 flex gap-2 rounded-md bg-mist p-3 text-xs leading-relaxed text-body">
          <CalendarClock className="h-4 w-4 shrink-0 text-ink" aria-hidden />
          Oversized or large orders are reviewed by our team — the delivery fee is confirmed before dispatch. Preferred delivery dates are subject to confirmation.
        </p>
        <Link href="/policies/delivery" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-ink hover:text-gold-dark">
          Delivery & pickup details <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
