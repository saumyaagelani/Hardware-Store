/** Simple, generic payment-method marks (text-based, no third-party logo artwork). */
const methods = ["Visa", "Mastercard", "Amex", "Apple Pay", "Google Pay", "Interac e-Transfer"];

export function PaymentIcons({ className }: { className?: string }) {
  return (
    <ul className={className ?? "flex flex-wrap gap-2"} aria-label="Accepted payment methods">
      {methods.map((m) => (
        <li key={m} className="rounded-sm border border-ink-line bg-ink-soft px-2 py-1 text-[0.6875rem] font-semibold tracking-wide text-white/80">
          {m}
        </li>
      ))}
    </ul>
  );
}
