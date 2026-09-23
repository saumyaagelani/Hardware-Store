import type { Order } from "@/lib/types";
import { formatDate, formatMoney } from "@/lib/format";
import { orderStatusMeta, paymentStatusMeta } from "@/lib/status";
import { StatusBadge } from "@/components/ui/badge";
import { Panel } from "./dashboard-ui";
import { Timeline } from "./timeline";

const paymentLabel = { card: "Credit card", apple_pay: "Apple Pay", google_pay: "Google Pay", etransfer: "Interac e-Transfer" } as const;

export function OrderDetailBody({ order, admin = false }: { order: Order; admin?: boolean }) {
  const f = order.fulfilment;
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
      <div className="space-y-5">
        <Panel title="Items" bodyClassName="p-0">
          <ul className="divide-y divide-line">
            {order.items.map((item, i) => (
              <li key={i} className="flex justify-between gap-4 px-5 py-3.5 text-sm">
                <span>
                  <span className="font-medium text-ink">{item.name}</span>
                  {item.optionsLabel ? <span className="block text-xs text-body">{item.optionsLabel}</span> : null}
                  <span className="block text-xs text-muted">
                    SKU {item.sku} · {item.quantity} × {formatMoney(item.unitPrice)}
                    {item.priceKind !== "retail" ? ` · ${item.priceKind === "contractor" ? "Contractor" : "Sale"} price` : ""}
                  </span>
                </span>
                <span className="font-semibold text-ink">{formatMoney(item.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <dl className="space-y-1.5 border-t border-line px-5 py-4 text-sm">
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
        </Panel>
        <div className="grid gap-5 md:grid-cols-2">
          <Panel title={f.method === "pickup" ? "Pickup" : "Delivery"}>
            {f.method === "pickup" ? (
              <div className="text-sm text-body">
                <p className="font-semibold text-ink">{f.locationName}</p>
                <p className="mt-1">Ready: {f.readyEstimate}</p>
              </div>
            ) : (
              <div className="text-sm text-body">
                <p className="text-ink">
                  {f.address.line1}
                  {f.address.line2 ? `, ${f.address.line2}` : ""}
                  <br />
                  {f.address.city}, {f.address.province} {f.address.postalCode}
                </p>
                {f.zoneName ? <p className="mt-2">Zone: {f.zoneName}</p> : null}
                {f.preferredDate ? <p className="mt-1">Preferred date: {formatDate(`${f.preferredDate}T12:00:00`)} (to be confirmed)</p> : null}
                {f.instructions ? <p className="mt-1">Instructions: {f.instructions}</p> : null}
                {f.feeToBeConfirmed ? <p className="mt-2 rounded-md bg-warning-soft p-2 text-xs text-warning">Delivery fee to be confirmed</p> : null}
              </div>
            )}
          </Panel>
          <Panel title="Payment">
            <div className="text-sm text-body">
              <p className="text-ink">
                {paymentLabel[order.payment.method]}
                {order.payment.cardBrand ? ` · ${order.payment.cardBrand} •••• ${order.payment.last4}` : ""}
              </p>
              <div className="mt-2">
                <StatusBadge tone={paymentStatusMeta[order.payment.status].tone}>{paymentStatusMeta[order.payment.status].label}</StatusBadge>
              </div>
              {admin ? <p className="mt-2 text-xs text-muted">Provider: {order.payment.provider} · {order.payment.reference}</p> : null}
            </div>
          </Panel>
        </div>
        {admin ? (
          <Panel title="Customer">
            <div className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <p className="font-semibold text-ink">{order.customer.fullName}</p>
                {order.customer.companyName ? <p className="text-body">{order.customer.companyName}</p> : null}
                <p className="text-body">{order.customer.email}</p>
                <p className="text-body">{order.customer.phone}</p>
                <p className="mt-1 text-xs text-muted">{order.guest ? "Guest checkout" : "Registered customer"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold tracking-wide text-body uppercase">Billing address</p>
                <p className="mt-1 text-ink">
                  {order.billingAddress.line1}
                  <br />
                  {order.billingAddress.city}, {order.billingAddress.province} {order.billingAddress.postalCode}
                </p>
              </div>
            </div>
            {order.notes ? <p className="mt-4 rounded-md bg-mist p-3 text-sm text-ink">Order note: {order.notes}</p> : null}
          </Panel>
        ) : null}
      </div>
      <Panel title="Status history" className="h-fit">
        <Timeline entries={order.history.map((h) => ({ label: orderStatusMeta[h.status].label, tone: orderStatusMeta[h.status].tone, at: h.at, note: h.note, by: admin ? h.by : undefined }))} />
      </Panel>
    </div>
  );
}
