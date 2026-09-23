import { Camera, FileCheck2, MessagesSquare, Ruler } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

const steps = [
  { icon: Ruler, title: "Share your project", body: "Products, colours, measurements or square footage." },
  { icon: Camera, title: "Attach photos or plans", body: "Floor plans, PDFs and site photos help us quote accurately." },
  { icon: MessagesSquare, title: "We review & advise", body: "Our team checks quantities, compatibility and lead times." },
  { icon: FileCheck2, title: "Receive your quote", body: "Itemised pricing, usually within one business day." },
];

export function QuoteSteps({ pitch }: { pitch: string }) {
  return (
    <section className="bg-mist">
      <div className="container-page py-14 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.6fr] lg:items-center">
          <div>
            <p className="eyebrow">Free quote service</p>
            <h2 className="mt-3 text-3xl leading-tight font-extrabold text-ink sm:text-[2.5rem]">Tell us about your project. We&apos;ll price it for free.</h2>
            <p className="mt-4 text-body">{pitch}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/quote" size="lg">
                Start your free quote
              </ButtonLink>
              <ButtonLink href="/cart" size="lg" variant="outline">
                Quote my cart
              </ButtonLink>
            </div>
          </div>
          <ol className="grid gap-4 sm:grid-cols-2">
            {steps.map(({ icon: Icon, title, body }, i) => (
              <li key={title} className="relative rounded-lg border border-line bg-white p-6">
                <span className="absolute top-5 right-5 font-display text-4xl font-extrabold text-mist">0{i + 1}</span>
                <span className="flex h-11 w-11 items-center justify-center rounded-md bg-ink text-gold">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <p className="mt-4 font-display text-lg font-bold text-ink">{title}</p>
                <p className="mt-1 text-sm leading-relaxed text-body">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
