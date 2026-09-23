"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/action-result";
import type { Order, PaymentMethod } from "@/lib/types";
import { addressSchema, emailField, fieldErrors, phoneField, requiredText } from "@/lib/validation";
import { cartTotals, estimateDelivery, orderTotals, priceCartLines } from "@/lib/cart";
import { nextOrderNumber } from "@/lib/quote-ref";
import { statusFromQuantity } from "@/lib/stock";
import { getDb, mutate, newId } from "@/server/db";
import { getCurrentUser, pricingViewerFor } from "@/server/auth/session";
import { getPaymentProvider } from "@/server/services/payments";
import { notifyOrderPlaced } from "@/server/services/notifications";
import { business } from "@/config/business";

const checkoutSchema = z.object({
  lines: z
    .array(
      z.object({
        productId: z.string().max(80),
        quantity: z.number().int().min(1).max(999),
        options: z.record(z.string().max(60), z.string().max(60)).optional(),
      }),
    )
    .min(1, "Your cart is empty")
    .max(100),
  contact: z.object({
    fullName: requiredText("Full name", 120),
    email: emailField,
    phone: phoneField,
    companyName: z.string().trim().max(160).optional().default(""),
  }),
  billing: addressSchema,
  fulfilment: z.discriminatedUnion("method", [
    z.object({ method: z.literal("pickup"), locationId: z.string().max(40) }),
    z.object({
      method: z.literal("delivery"),
      sameAsBilling: z.boolean(),
      address: addressSchema.optional(),
      preferredDate: z.string().max(20).optional().default(""),
      instructions: z.string().trim().max(500).optional().default(""),
    }),
  ]),
  payment: z.object({
    method: z.enum(["card", "apple_pay", "google_pay", "etransfer"]),
    token: z.string().max(80).optional(),
  }),
  notes: z.string().trim().max(1000).optional().default(""),
});

export type CheckoutInput = z.input<typeof checkoutSchema>;

export async function placeOrderAction(input: CheckoutInput): Promise<ActionResult<{ orderId: string; number: string }>> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please check the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };
  const d = parsed.data;
  const user = await getCurrentUser();
  const db = getDb();

  // Always re-price on the server — never trust prices from the browser.
  const lines = priceCartLines(d.lines, db.products, pricingViewerFor(user));
  if (!lines.length) return { ok: false, error: "Your cart is empty." };
  const problem = lines.find((l) => l.issue);
  if (problem) return { ok: false, error: `${problem.name}: ${problem.issue}` };
  const totals = cartTotals(lines);

  // Fulfilment
  let fulfilment: Order["fulfilment"];
  let deliveryFee = 0;
  if (d.fulfilment.method === "pickup") {
    const locationId = d.fulfilment.locationId;
    const location = db.settings.pickupLocations.find((l) => l.id === locationId && l.active);
    if (!location) return { ok: false, fieldErrors: { "fulfilment.locationId": "Choose a pickup location" } };
    fulfilment = { method: "pickup", locationId: location.id, locationName: location.name, readyEstimate: location.readyTime };
  } else {
    const address = d.fulfilment.sameAsBilling ? d.billing : d.fulfilment.address;
    if (!address) return { ok: false, fieldErrors: { "fulfilment.address.line1": "Enter a delivery address" } };
    const estimate = estimateDelivery(address.postalCode, lines, totals.subtotal, db.settings);
    if (estimate.status !== "ok") {
      return { ok: false, error: estimate.message, fieldErrors: { [d.fulfilment.sameAsBilling ? "billing.postalCode" : "fulfilment.address.postalCode"]: estimate.message } };
    }
    if (d.fulfilment.preferredDate) {
      const preferred = new Date(`${d.fulfilment.preferredDate}T12:00:00`);
      const tomorrow = new Date();
      tomorrow.setHours(0, 0, 0, 0);
      tomorrow.setDate(tomorrow.getDate() + 1);
      if (Number.isNaN(preferred.getTime()) || preferred < tomorrow) {
        return { ok: false, fieldErrors: { "fulfilment.preferredDate": "Choose a date from tomorrow onwards" } };
      }
    }
    deliveryFee = estimate.fee;
    fulfilment = {
      method: "delivery",
      address: { ...address, name: d.contact.fullName },
      zoneId: estimate.zone.id,
      zoneName: estimate.zone.name,
      feeToBeConfirmed: estimate.feeToBeConfirmed,
      preferredDate: d.fulfilment.preferredDate || undefined,
      instructions: d.fulfilment.instructions || undefined,
    };
  }

  const amounts = orderTotals(totals.subtotal, deliveryFee, db.settings.taxRate);
  const method = d.payment.method as PaymentMethod;
  if (method === "card" && !d.payment.token) return { ok: false, error: "Enter your card details." };

  const charge = await getPaymentProvider().charge({
    amount: amounts.total,
    currency: business.currency,
    method,
    token: d.payment.token,
    description: `${business.name} order`,
  });
  if (charge.status === "failed") {
    return { ok: false, error: charge.message ?? "Payment failed. Please try another payment method." };
  }

  const now = new Date().toISOString();
  const order = mutate((m) => {
    const next = nextOrderNumber(m.counters);
    m.counters = next.counters;
    const created: Order = {
      id: newId("ord"),
      number: next.number,
      createdAt: now,
      userId: user?.id,
      guest: !user,
      customer: { fullName: d.contact.fullName, email: d.contact.email, phone: d.contact.phone, companyName: d.contact.companyName || undefined },
      billingAddress: { ...d.billing, name: d.contact.fullName },
      fulfilment,
      items: lines.map((l) => ({
        productId: l.productId,
        name: l.name,
        sku: l.sku,
        optionsLabel: l.optionsLabel,
        quantity: l.quantity,
        unitPrice: l.unitPrice ?? 0,
        priceKind: l.price.mode === "price" ? l.price.kind : "retail",
        unit: l.unit,
        lineTotal: l.lineTotal ?? 0,
      })),
      ...amounts,
      taxRate: m.settings.taxRate,
      taxLabel: m.settings.taxLabel,
      payment: {
        method,
        status: charge.status,
        provider: getPaymentProvider().name,
        reference: charge.reference,
        cardBrand: charge.cardBrand,
        last4: charge.last4,
      },
      status: charge.status === "awaiting_payment" ? "awaiting_payment" : "processing",
      history: [{ status: charge.status === "awaiting_payment" ? "awaiting_payment" : "processing", at: now, by: "Website" }],
      notes: d.notes || undefined,
    };
    m.orders.unshift(created);
    // Demo inventory: decrement on-hand quantities (special-order items are unaffected).
    for (const line of created.items) {
      const product = m.products.find((p) => p.id === line.productId);
      if (!product || product.inventory.status === "special_order") continue;
      product.inventory.quantity = Math.max(0, product.inventory.quantity - line.quantity);
      product.inventory.status = statusFromQuantity(product.inventory.quantity, product.inventory.lowStockThreshold, product.inventory.status);
    }
    return created;
  });

  await notifyOrderPlaced(order);
  revalidatePath("/", "layout");
  return { ok: true, orderId: order.id, number: order.number };
}
