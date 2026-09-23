"use server";

import { z } from "zod";
import type { CartLine } from "@/lib/types";
import { cartTotals, estimateDelivery, priceCartLines, type CartTotals, type DeliveryEstimate, type PricedCartLine } from "@/lib/cart";
import { getDb } from "@/server/db";
import { getPricingViewer } from "@/server/auth/session";

const linesSchema = z
  .array(
    z.object({
      productId: z.string().max(80),
      quantity: z.number().int().min(1).max(999),
      options: z.record(z.string().max(60), z.string().max(60)).optional(),
    }),
  )
  .max(100);

export interface CartSnapshot {
  lines: PricedCartLine[];
  totals: CartTotals;
  contractorPricing: boolean;
}

/** Price the browser's cart on the server for whoever is signed in. */
export async function getCartAction(lines: CartLine[]): Promise<CartSnapshot> {
  const parsed = linesSchema.safeParse(lines);
  const viewer = await getPricingViewer();
  const priced = priceCartLines(parsed.success ? parsed.data : [], getDb().products, viewer);
  return {
    lines: priced,
    totals: cartTotals(priced),
    contractorPricing: priced.some((l) => l.price.mode === "price" && l.price.kind === "contractor"),
  };
}

export async function estimateDeliveryAction(postalCode: string, lines: CartLine[]): Promise<DeliveryEstimate> {
  const parsed = linesSchema.safeParse(lines);
  const viewer = await getPricingViewer();
  const priced = priceCartLines(parsed.success ? parsed.data : [], getDb().products, viewer);
  const totals = cartTotals(priced);
  return estimateDelivery(String(postalCode).slice(0, 10), priced, totals.subtotal, getDb().settings);
}
