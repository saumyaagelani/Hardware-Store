import { FileText, HardHat, Store, Truck } from "lucide-react";

const props = [
  { icon: Store, title: "Free in-store pickup", body: "Most orders ready within 2 business hours" },
  { icon: Truck, title: "Local delivery", body: "Curbside delivery across our service zones" },
  { icon: HardHat, title: "Contractor pricing", body: "Approved trade accounts save automatically" },
  { icon: FileText, title: "Free project quotes", body: "Send measurements or photos — we'll do the rest" },
];

export function ValueProps() {
  return (
    <section aria-label="Why shop with us" className="border-b border-line bg-white">
      <ul className="container-page grid grid-cols-2 gap-x-4 gap-y-6 py-8 lg:grid-cols-4 lg:py-10">
        {props.map(({ icon: Icon, title, body }) => (
          <li key={title} className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-gold-soft text-ink">
              <Icon className="h-5.5 w-5.5" aria-hidden />
            </span>
            <span>
              <span className="block font-display text-base font-bold text-ink">{title}</span>
              <span className="mt-0.5 block text-[0.8125rem] leading-snug text-body">{body}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
