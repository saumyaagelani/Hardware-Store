import { BadgeDollarSign, ClipboardList, HardHat, Truck, Users } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

const perks = [
  { icon: BadgeDollarSign, title: "Contractor pricing", body: "Trade prices shown automatically on eligible products once approved." },
  { icon: ClipboardList, title: "Project quotes", body: "Upload plans and takeoffs for itemised, job-specific pricing." },
  { icon: Truck, title: "Job-site delivery", body: "Schedule deliveries to your site or pick up from the contractor yard." },
  { icon: Users, title: "Dedicated contact", body: "A named account contact for orders, special orders and returns." },
];

export function ContractorBand({ pitch }: { pitch: string }) {
  return (
    <section className="bg-ink text-white">
      <div className="container-page grid gap-12 py-14 lg:grid-cols-[1fr_1.1fr] lg:py-20">
        <div>
          <p className="eyebrow text-gold!">For contractors & trade</p>
          <h2 className="mt-3 text-3xl leading-tight font-extrabold sm:text-[2.5rem]">Built for the trade. Priced for the trade.</h2>
          <p className="mt-4 max-w-lg text-white/75">{pitch}</p>
          <ol className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-0">
            {["Apply online", "We verify your business", "Contractor pricing unlocks"].map((step, i) => (
              <li key={step} className="flex items-center gap-3 sm:flex-1">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold font-display font-bold text-ink">{i + 1}</span>
                <span className="text-sm font-semibold">{step}</span>
                {i < 2 ? <span aria-hidden className="mx-3 hidden h-px flex-1 bg-ink-line sm:block" /> : null}
              </li>
            ))}
          </ol>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/contractors/apply" size="lg">
              <HardHat className="h-5 w-5" aria-hidden /> Apply for a trade account
            </ButtonLink>
            <ButtonLink href="/account/login" size="lg" variant="outline-light">
              Contractor sign in
            </ButtonLink>
          </div>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2">
          {perks.map(({ icon: Icon, title, body }) => (
            <li key={title} className="rounded-lg border border-ink-line bg-ink-soft p-6">
              <Icon className="h-7 w-7 text-gold" aria-hidden />
              <p className="mt-4 font-display text-lg font-bold">{title}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-white/70">{body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
