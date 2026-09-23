"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { AlertCircle, CalendarDays, CreditCard, Landmark, Lock, PackageCheck, ShieldCheck, Smartphone, Truck } from "lucide-react";
import type { Address, PaymentMethod, PickupLocation } from "@/lib/types";
import type { DeliveryEstimate } from "@/lib/cart";
import { formatMoney } from "@/lib/format";
import { tokenizeDemoCard, formatCardNumber, formatExpiry, detectBrand, type CardInput } from "@/lib/demo-card";
import { track } from "@/lib/analytics";
import { estimateDeliveryAction } from "@/app/actions/cart";
import { placeOrderAction } from "@/app/actions/checkout";
import { useCart } from "@/components/cart/cart-provider";
import { usePricedCart } from "@/components/cart/use-priced-cart";
import { AddressFields, emptyAddress, type AddressValue } from "@/components/forms/address-fields";
import { Checkbox, ChoiceCards, SelectField, TextField, TextareaField } from "@/components/ui/fields";
import { Button, ButtonLink } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { business } from "@/config/business";
import { ShoppingCart } from "lucide-react";
import { cn } from "@/lib/cn";

export interface CheckoutUser {
  fullName: string;
  email: string;
  phone: string;
  companyName?: string;
  billingAddress?: Address;
  deliveryAddresses: Address[];
}

function toValue(a?: Address): AddressValue {
  return a ? { line1: a.line1, line2: a.line2 ?? "", city: a.city, province: a.province, postalCode: a.postalCode, country: a.country } : emptyAddress;
}

function Step({ n, title, children, aside }: { n: number; title: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-line bg-white p-5 sm:p-6" aria-labelledby={`step-${n}`}>
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 id={`step-${n}`} className="flex items-center gap-3 font-display text-xl font-bold text-ink">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink font-display text-sm text-gold">{n}</span>
          {title}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

function tomorrowISO() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export function CheckoutForm({
  user,
  pickupLocations,
  taxRate,
  taxLabel,
}: {
  user: CheckoutUser | null;
  pickupLocations: PickupLocation[];
  taxRate: number;
  taxLabel: string;
}) {
  const router = useRouter();
  const { lines, hydrated, clear } = useCart();
  const { snapshot, loading } = usePricedCart();
  const [pending, start] = useTransition();

  const [contact, setContact] = useState({ fullName: user?.fullName ?? "", email: user?.email ?? "", phone: user?.phone ?? "", companyName: user?.companyName ?? "" });
  const [method, setMethod] = useState<"pickup" | "delivery">("pickup");
  const [locationId, setLocationId] = useState(pickupLocations[0]?.id ?? "");
  const [delivery, setDelivery] = useState<AddressValue>(toValue(user?.deliveryAddresses[0] ?? user?.billingAddress));
  const [preferredDate, setPreferredDate] = useState("");
  const [instructions, setInstructions] = useState("");
  const [billingSame, setBillingSame] = useState(true);
  const [billing, setBilling] = useState<AddressValue>(toValue(user?.billingAddress));
  const [payment, setPayment] = useState<PaymentMethod>("card");
  const [card, setCard] = useState<CardInput>({ number: "", expiry: "", cvc: "", name: user?.fullName ?? "" });
  const [cardErrors, setCardErrors] = useState<Partial<Record<keyof CardInput, string>>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [estimate, setEstimate] = useState<DeliveryEstimate | null>(null);
  const [walletOpen, setWalletOpen] = useState(false);
  const [notes, setNotes] = useState("");

  const cartKey = JSON.stringify(lines);
  useEffect(() => {
    if (method !== "delivery" || delivery.postalCode.replace(/\s/g, "").length < 6) return;
    let cancelled = false;
    estimateDeliveryAction(delivery.postalCode, JSON.parse(cartKey)).then((res) => !cancelled && setEstimate(res));
    return () => {
      cancelled = true;
    };
  }, [method, delivery.postalCode, cartKey]);

  useEffect(() => {
    if (snapshot?.lines.length) track("begin_checkout", { value: snapshot.totals.subtotal, currency: "CAD" });
  }, [snapshot?.lines.length, snapshot?.totals.subtotal]);

  if (hydrated && lines.length === 0) {
    return (
      <EmptyState icon={ShoppingCart} title="Your cart is empty" description="Add products to your cart before checking out.">
        <ButtonLink href="/shop" variant="dark">
          Browse products
        </ButtonLink>
      </EmptyState>
    );
  }

  const subtotal = snapshot?.totals.subtotal ?? 0;
  const deliveryFee = method === "delivery" && estimate?.status === "ok" ? estimate.fee : 0;
  const tax = Math.round((subtotal + deliveryFee) * taxRate * 100) / 100;
  const total = Math.round((subtotal + deliveryFee + tax) * 100) / 100;
  const pickup = pickupLocations.find((l) => l.id === locationId);
  const blocked = !snapshot || snapshot.totals.hasIssues || (method === "delivery" && estimate?.status !== "ok");

  const err = (path: string) => errors[path];
  const deliveryErrors: Record<string, string | undefined> = {};
  for (const key of ["line1", "line2", "city", "province", "postalCode"]) {
    deliveryErrors[`delivery.${key}`] = errors[`fulfilment.address.${key}`] ?? (billingSame ? errors[`billing.${key}`] : undefined);
  }

  function submit(walletConfirmed = false) {
    setFormError(null);
    setErrors({});
    setCardErrors({});
    let token: string | undefined;
    if (payment === "card") {
      const result = tokenizeDemoCard({ ...card, name: card.name || contact.fullName });
      if (!result.ok) {
        setCardErrors(result.errors);
        setFormError("Please check your card details.");
        return;
      }
      token = result.token;
    }
    if ((payment === "apple_pay" || payment === "google_pay") && !walletConfirmed) {
      setWalletOpen(true);
      return;
    }
    const billingAddress = method === "delivery" && billingSame ? delivery : billing;
    start(async () => {
      const res = await placeOrderAction({
        lines,
        contact,
        billing: billingAddress,
        fulfilment:
          method === "pickup"
            ? { method: "pickup", locationId }
            : { method: "delivery", sameAsBilling: billingSame, address: billingSame ? undefined : delivery, preferredDate, instructions },
        payment: { method: payment, token },
        notes,
      });
      if (res.ok) {
        track("purchase", { transaction_id: res.number, value: total, currency: "CAD" });
        clear();
        router.push(`/checkout/confirmation/${res.orderId}`);
      } else {
        setErrors(res.fieldErrors ?? {});
        setFormError(res.error ?? "Please check the highlighted fields.");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="grid gap-8 lg:grid-cols-[1fr_400px] lg:gap-10"
    >
      <div className="space-y-5">
        {formError ? (
          <div role="alert" className="flex items-start gap-3 rounded-lg border border-danger/30 bg-danger-soft p-4 text-sm text-danger">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
            <p className="font-medium">{formError}</p>
          </div>
        ) : null}

        <Step
          n={1}
          title="Contact information"
          aside={
            user ? (
              <span className="text-sm text-body">Signed in</span>
            ) : (
              <Link href="/account/login?next=/checkout" className="text-sm font-semibold text-ink underline decoration-gold decoration-2 underline-offset-2">
                Sign in
              </Link>
            )
          }
        >
          {!user ? <p className="-mt-2 mb-4 text-sm text-body">Checking out as a guest — no account needed. You can create one after your order.</p> : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Email" type="email" required autoComplete="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} error={err("contact.email")} containerClassName="sm:col-span-2" hint="We'll send your order confirmation here." />
            <TextField label="Full name" required autoComplete="name" value={contact.fullName} onChange={(e) => setContact({ ...contact, fullName: e.target.value })} error={err("contact.fullName")} />
            <TextField label="Phone" type="tel" required autoComplete="tel" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} error={err("contact.phone")} />
            <TextField label="Company" optional autoComplete="organization" value={contact.companyName} onChange={(e) => setContact({ ...contact, companyName: e.target.value })} containerClassName="sm:col-span-2" />
          </div>
        </Step>

        <Step n={2} title="Delivery or pickup">
          <ChoiceCards
            name="method"
            legend="How would you like to receive your order?"
            hideLegend
            value={method}
            onChange={setMethod}
            options={[
              { value: "pickup", label: "Pickup", aside: "Free", icon: <PackageCheck className="h-5 w-5" />, description: "Collect from our warehouse — usually ready within 2 business hours." },
              { value: "delivery", label: "Delivery", aside: estimate?.status === "ok" ? (estimate.feeToBeConfirmed ? "TBC" : estimate.fee === 0 ? "Free" : formatMoney(estimate.fee)) : "From $79", icon: <Truck className="h-5 w-5" />, description: "Local delivery zones. Fee based on your postal code." },
            ]}
          />

          {method === "pickup" ? (
            <div className="mt-5 space-y-3">
              <SelectField label="Pickup location" options={pickupLocations.map((l) => ({ value: l.id, label: l.name }))} value={locationId} onChange={(e) => setLocationId(e.target.value)} error={err("fulfilment.locationId")} />
              {pickup ? (
                <div className="rounded-md bg-mist p-4 text-sm">
                  <p className="font-semibold text-ink">{pickup.name}</p>
                  <p className="text-body">
                    {pickup.address.line1}, {pickup.address.city}, {pickup.address.province} {pickup.address.postalCode}
                  </p>
                  <p className="mt-2 text-body">
                    <span className="font-medium text-ink">Hours:</span> {pickup.hours}
                  </p>
                  <p className="mt-1 text-body">
                    <span className="font-medium text-ink">Ready:</span> {pickup.readyTime} — we&apos;ll email you when it&apos;s ready.
                  </p>
                  <p className="mt-2 text-body">{pickup.instructions}</p>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {user && user.deliveryAddresses.length > 1 ? (
                <SelectField
                  label="Saved addresses"
                  options={user.deliveryAddresses.map((a, i) => ({ value: String(i), label: `${a.label ?? "Address"} — ${a.line1}, ${a.city}` }))}
                  onChange={(e) => setDelivery(toValue(user.deliveryAddresses[Number(e.target.value)]))}
                />
              ) : null}
              <AddressFields prefix="delivery" value={delivery} onChange={setDelivery} errors={deliveryErrors} />
              {estimate ? (
                <p
                  role="status"
                  className={cn(
                    "rounded-md p-3 text-sm",
                    estimate.status === "ok" ? (estimate.feeToBeConfirmed ? "bg-warning-soft text-warning" : "bg-success-soft text-success") : "bg-danger-soft text-danger",
                  )}
                >
                  {estimate.status === "ok" ? (
                    <>
                      <strong>{estimate.zone.name}</strong> — {estimate.feeToBeConfirmed ? "Delivery fee to be confirmed. " : estimate.freeDelivery ? "Free delivery. " : `${formatMoney(estimate.fee)}. `}
                      {estimate.message}
                    </>
                  ) : (
                    estimate.message
                  )}
                </p>
              ) : (
                <p className="text-sm text-body">Enter your postal code to see the delivery fee for your area.</p>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  label="Preferred delivery date"
                  optional
                  type="date"
                  min={tomorrowISO()}
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  error={err("fulfilment.preferredDate")}
                  hint={
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" aria-hidden /> Subject to confirmation by our team
                    </span>
                  }
                />
                <TextField label="Delivery instructions" optional value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="Gate code, leave in garage…" />
              </div>
            </div>
          )}
        </Step>

        <Step n={3} title="Billing address">
          {method === "delivery" ? <Checkbox label="Same as delivery address" checked={billingSame} onChange={(e) => setBillingSame(e.target.checked)} className="mb-4" /> : null}
          {method === "pickup" || !billingSame ? <AddressFields prefix="billing" value={billing} onChange={setBilling} errors={errors} /> : null}
        </Step>

        <Step
          n={4}
          title="Payment"
          aside={
            <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
              <ShieldCheck className="h-4 w-4" aria-hidden /> Secure
            </span>
          }
        >
          <div className="mb-4 rounded-md border border-dashed border-gold-dark bg-gold-soft p-3 text-xs leading-relaxed text-ink">
            <strong>Prototype payment mode.</strong> No real charges are made. Use test card <code className="font-semibold">4242 4242 4242 4242</code> (any future expiry, any CVC), or <code className="font-semibold">4000 0000 0000 0002</code> to see a declined payment.
          </div>
          <ChoiceCards
            name="payment"
            legend="Payment method"
            hideLegend
            value={payment}
            onChange={(v) => {
              setPayment(v);
              setFormError(null);
            }}
            columns={2}
            options={[
              { value: "card", label: "Credit card", icon: <CreditCard className="h-5 w-5" />, description: "Visa, Mastercard, American Express" },
              { value: "apple_pay", label: "Apple Pay", icon: <Smartphone className="h-5 w-5" />, description: "Pay with a supported Apple device" },
              { value: "google_pay", label: "Google Pay", icon: <Smartphone className="h-5 w-5" />, description: "Pay with your Google account" },
              { value: "etransfer", label: "Interac e-Transfer", icon: <Landmark className="h-5 w-5" />, description: "Pay by e-Transfer after ordering" },
            ]}
          />
          {payment === "card" ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-4">
              <TextField
                containerClassName="sm:col-span-4"
                label="Card number"
                inputMode="numeric"
                autoComplete="cc-number"
                placeholder="1234 1234 1234 1234"
                value={card.number}
                onChange={(e) => setCard({ ...card, number: formatCardNumber(e.target.value) })}
                error={cardErrors.number}
                hint={card.number ? `Detected: ${{ visa: "Visa", mastercard: "Mastercard", amex: "American Express", unknown: "—" }[detectBrand(card.number)]}` : undefined}
              />
              <TextField containerClassName="sm:col-span-2" label="Expiry (MM / YY)" inputMode="numeric" autoComplete="cc-exp" placeholder="MM / YY" value={card.expiry} onChange={(e) => setCard({ ...card, expiry: formatExpiry(e.target.value) })} error={cardErrors.expiry} />
              <TextField containerClassName="sm:col-span-2" label="Security code" inputMode="numeric" autoComplete="cc-csc" placeholder="CVC" maxLength={4} value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value.replace(/\D/g, "") })} error={cardErrors.cvc} />
              <TextField containerClassName="sm:col-span-4" label="Name on card" autoComplete="cc-name" placeholder={contact.fullName || undefined} hint={!card.name && contact.fullName ? "Defaults to your contact name" : undefined} value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} error={cardErrors.name} />
            </div>
          ) : null}
          {payment === "etransfer" ? (
            <div className="mt-5 rounded-md bg-mist p-4 text-sm text-body">
              <p className="font-semibold text-ink">How Interac e-Transfer works</p>
              <ol className="mt-2 list-decimal space-y-1 pl-5">
                <li>Place your order — we&apos;ll reserve your items.</li>
                <li>
                  Send {formatMoney(total)} to <strong className="text-ink">{business.email}</strong> with your order number in the message.
                </li>
                <li>We&apos;ll confirm payment and begin processing (usually same business day).</li>
              </ol>
            </div>
          ) : null}
          {payment === "apple_pay" || payment === "google_pay" ? (
            <p className="mt-4 text-sm text-body">You&apos;ll confirm the payment in the {payment === "apple_pay" ? "Apple Pay" : "Google Pay"} sheet after pressing “Place order”.</p>
          ) : null}
        </Step>

        <TextareaField label="Order notes" optional value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything we should know about this order?" rows={3} />
      </div>

      <aside className="h-fit lg:sticky lg:top-6" aria-label="Order summary">
        <div className="rounded-lg border border-line bg-canvas p-5 sm:p-6">
          <h2 className="font-display text-xl font-bold text-ink">Order summary</h2>
          <ul className="mt-4 max-h-80 divide-y divide-line overflow-y-auto">
            {loading || !snapshot
              ? lines.map((_, i) => (
                  <li key={i} className="flex gap-3 py-3">
                    <div className="skeleton h-14 w-14 rounded-md" />
                    <div className="skeleton h-4 flex-1 rounded" />
                  </li>
                ))
              : snapshot.lines.map((l) => (
                  <li key={l.key} className="flex gap-3 py-3">
                    <span className="relative shrink-0">
                      {l.image ? <img src={l.image.src} alt="" className="h-14 w-14 rounded-md bg-mist object-cover ring-1 ring-line" /> : null}
                      <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-[0.6875rem] font-bold text-white">{l.quantity}</span>
                    </span>
                    <span className="min-w-0 flex-1 text-sm">
                      <span className="line-clamp-2 font-medium text-ink">{l.name}</span>
                      {l.optionsLabel ? <span className="block text-xs text-body">{l.optionsLabel}</span> : null}
                      {l.issue ? <span className="block text-xs text-warning">{l.issue}</span> : null}
                    </span>
                    <span className="text-sm font-semibold text-ink">{l.lineTotal !== null ? formatMoney(l.lineTotal) : "Quote"}</span>
                  </li>
                ))}
          </ul>
          {snapshot?.contractorPricing ? <p className="mt-2 text-xs font-semibold text-gold-dark">Contractor pricing applied</p> : null}
          <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-body">Subtotal</dt>
              <dd className="font-medium text-ink">{formatMoney(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-body">{method === "pickup" ? "Pickup" : "Delivery"}</dt>
              <dd className="font-medium text-ink">
                {method === "pickup" ? "Free" : estimate?.status === "ok" ? (estimate.feeToBeConfirmed ? "To be confirmed" : estimate.fee === 0 ? "Free" : formatMoney(estimate.fee)) : "Enter postal code"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-body">{taxLabel}</dt>
              <dd className="font-medium text-ink">{formatMoney(tax)}</dd>
            </div>
          </dl>
          <div className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
            <span className="font-semibold text-ink">Total</span>
            <span className="font-display text-2xl font-bold text-ink">
              <span className="mr-1 text-xs font-medium text-body">CAD</span>
              {formatMoney(total)}
            </span>
          </div>
          <Button type="submit" size="lg" className="mt-5 w-full" loading={pending} disabled={blocked}>
            <Lock className="h-4.5 w-4.5" aria-hidden /> {payment === "etransfer" ? "Place order" : `Place order · ${formatMoney(total)}`}
          </Button>
          {snapshot?.totals.hasIssues ? (
            <p className="mt-2 text-xs text-warning">
              Some items can&apos;t be ordered online. <Link href="/cart" className="font-semibold underline">Review your cart</Link>.
            </p>
          ) : null}
          <p className="mt-3 text-center text-xs text-body">
            By placing your order you agree to our <Link href="/policies/terms" className="underline">terms</Link> and <Link href="/policies/returns" className="underline">returns policy</Link>.
          </p>
        </div>
      </aside>

      <Dialog open={walletOpen} onClose={() => setWalletOpen(false)} title={payment === "apple_pay" ? "Apple Pay (demo)" : "Google Pay (demo)"}>
        <div className="p-6 text-center">
          <Smartphone className="mx-auto h-10 w-10 text-ink" aria-hidden />
          <p className="mt-3 font-display text-2xl font-bold text-ink">{formatMoney(total)}</p>
          <p className="mt-1 text-sm text-body">Pay {business.name}</p>
          <p className="mt-4 rounded-md bg-mist p-3 text-xs text-body">This simulates the wallet payment sheet. In production it is provided by the payment processor (e.g. Stripe Payment Request).</p>
          <div className="mt-5 grid gap-2">
            <Button
              variant="dark"
              size="lg"
              onClick={() => {
                setWalletOpen(false);
                submit(true);
              }}
            >
              Confirm payment
            </Button>
            <Button variant="ghost" onClick={() => setWalletOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Dialog>
    </form>
  );
}
