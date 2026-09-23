import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock, Landmark, Mail, MapPin, Truck, UserPlus } from "lucide-react";
import { getDb } from "@/server/db";
import { getCurrentUser } from "@/server/auth/session";
import { formatDate, formatMoney } from "@/lib/format";
import { orderStatusMeta, paymentStatusMeta } from "@/lib/status";
import { StatusBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { business } from "@/config/business";

export const metadata: Metadata = { title: "Order confirmed", robots: { index: false } };

const paymentLabel = { card: "Credit card", apple_pay: "Apple Pay", google_pay: "Google Pay", etransfer: "Interac e-Transfer" } as const;

export default async function ConfirmationPage({ params }: PageProps<"/checkout/confirmation/[id]">) {
  const { id } = await params;
  const order = getDb().orders.find((o) => o.id === id);
  if (!order) notFound();
  const user = await getCurrentUser();
  // Order ids are unguessable; signed-in users may only view their own orders.
  if (user && order.userId && order.userId !== user.id && user.role === "customer") notFound();

  const f = order.fulfilment;
  return (
    <div className="bg-canvas">
      <div className="container-page max-w-4xl py-10 lg:py-14">
        <div className="rounded-lg border border-line bg-white p-6 text-center sm:p-10">
          <CheckCircle2 className="mx-auto h-14 w-14 text-success" aria-hidden />
          <p className="eyebrow mt-4">Order confirmed</p>
          <h1 className="mt-2 text-3xl font-extrabold text-ink sm:text-4xl">Thank you, {order.customer.fullName.split(" ")[0]}!</h1>
          <p className="mt-3 text-body">
            Your order number is <strong className="font-display text-lg text-ink">{order.number}</strong>
          </p>
          <p className="mx-auto mt-3 flex max-w-md items-center justify-center gap-2 text-sm text-body">
            <Mail className="h-4 w-4 shrink-0" aria-hidden /> A confirmation email has been sent to {order.customer.email} <span className="text-xs text-muted">(simulated in prototype)</span>
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <StatusBadge tone={orderStatusMeta[order.status].tone}>{orderStatusMeta[order.status].label}</StatusBadge>
            <StatusBadge tone={paymentStatusMeta[order.payment.status].tone}>{paymentStatusMeta[order.payment.status].label}</StatusBadge>
          </div>
        </div>

        {order.payment.method === "etransfer" && order.payment.status === "awaiting_payment" ? (
          <div className="mt-5 flex gap-4 rounded-lg border border-gold-dark bg-gold-soft p-5">
            <Landmark className="h-6 w-6 shrink-0 text-ink" aria-hidden />
            <div className="text-sm text-ink">
              <p className="font-semibold">Complete your Interac e-Transfer</p>
              <p className="mt-1">
                Send <strong>{formatMoney(order.total)}</strong> to <strong>{business.email}</strong> and include <strong>{order.number}</strong> in the message. We&apos;ll start processing once payment is received.
              </p>
            </div>
          </div>
        ) : null}

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div className="rounded-lg border border-line bg-white p-5">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
              {f.method === "pickup" ? <MapPin className="h-5 w-5 text-gold-dark" aria-hidden /> : <Truck className="h-5 w-5 text-gold-dark" aria-hidden />}
              {f.method === "pickup" ? "Pickup details" : "Delivery details"}
            </h2>
            {f.method === "pickup" ? (
              <div className="mt-3 text-sm text-body">
                <p className="font-semibold text-ink">{f.locationName}</p>
                <p className="mt-1 flex items-center gap-1.5">
                  <Clock className="h-4 w-4" aria-hidden /> Ready: {f.readyEstimate}
                </p>
                <p className="mt-2">We&apos;ll notify you when your order is ready. Bring your order number.</p>
              </div>
            ) : (
              <div className="mt-3 text-sm text-body">
                <p className="text-ink">
                  {f.address.line1}
                  {f.address.line2 ? `, ${f.address.line2}` : ""}
                  <br />
                  {f.address.city}, {f.address.province} {f.address.postalCode}
                </p>
                <p className="mt-2">{f.zoneName}</p>
                {f.preferredDate ? <p className="mt-1">Requested date: {formatDate(`${f.preferredDate}T12:00:00`, { dateStyle: "long" })} — we&apos;ll confirm by {order.customer.email}.</p> : null}
                {f.feeToBeConfirmed ? <p className="mt-2 rounded-md bg-warning-soft p-2 text-warning">Delivery fee to be confirmed by our team before dispatch.</p> : null}
              </div>
            )}
          </div>
          <div className="rounded-lg border border-line bg-white p-5">
            <h2 className="font-display text-lg font-bold text-ink">Payment</h2>
            <p className="mt-3 text-sm text-body">
              {paymentLabel[order.payment.method]}
              {order.payment.cardBrand ? ` · ${order.payment.cardBrand} ending ${order.payment.last4}` : ""}
            </p>
            <p className="mt-1 text-xs text-muted">Reference {order.payment.reference}</p>
            <p className="mt-3 text-sm text-body">Placed {formatDate(order.createdAt, { dateStyle: "long" })}</p>
          </div>
        </div>

        <div className="mt-5 rounded-lg border border-line bg-white p-5 sm:p-6">
          <h2 className="font-display text-lg font-bold text-ink">Items</h2>
          <ul className="mt-3 divide-y divide-line">
            {order.items.map((item) => (
              <li key={`${item.productId}-${item.optionsLabel}`} className="flex justify-between gap-4 py-3 text-sm">
                <span>
                  <span className="font-medium text-ink">
                    {item.quantity} × {item.name}
                  </span>
                  {item.optionsLabel ? <span className="block text-xs text-body">{item.optionsLabel}</span> : null}
                  <span className="block text-xs text-muted">
                    SKU {item.sku} · {formatMoney(item.unitPrice)} each{item.priceKind === "contractor" ? " · Contractor price" : ""}
                  </span>
                </span>
                <span className="font-semibold text-ink">{formatMoney(item.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-3 space-y-1.5 border-t border-line pt-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-body">Subtotal</dt>
              <dd>{formatMoney(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-body">{f.method === "pickup" ? "Pickup" : "Delivery"}</dt>
              <dd>{f.method === "delivery" && f.feeToBeConfirmed ? "To be confirmed" : order.deliveryFee ? formatMoney(order.deliveryFee) : "Free"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-body">{order.taxLabel}</dt>
              <dd>{formatMoney(order.tax)}</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-2 text-base font-bold text-ink">
              <dt>Total</dt>
              <dd>{formatMoney(order.total)}</dd>
            </div>
          </dl>
        </div>

        {order.guest && !user ? (
          <div className="mt-5 flex flex-col items-start gap-4 rounded-lg bg-ink p-6 text-white sm:flex-row sm:items-center">
            <UserPlus className="h-8 w-8 shrink-0 text-gold" aria-hidden />
            <div className="flex-1">
              <p className="font-display text-lg font-bold">Save time on your next order</p>
              <p className="text-sm text-white/70">Create an account to track orders, save addresses and request quotes.</p>
            </div>
            <ButtonLink href={`/account/register?email=${encodeURIComponent(order.customer.email)}`}>Create account</ButtonLink>
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/shop" variant="dark">
            Continue shopping
          </ButtonLink>
          {user ? (
            <ButtonLink href="/account/orders" variant="outline">
              View my orders
            </ButtonLink>
          ) : null}
        </div>
        <p className="mt-6 text-center text-sm text-body">
          Questions? Call <a href={business.phoneHref} className="font-semibold text-ink">{business.phone}</a> or <Link href="/contact" className="font-semibold text-ink underline">contact us</Link>.
        </p>
      </div>
    </div>
  );
}
