import type { CartLine, DeliveryZone, PriceView, Product, SellingUnit, StoreSettings } from "./types";
import { optionAdjustment, resolvePrice, type PricingViewer } from "./pricing";
import { describeStock, type StockDisplay } from "./stock";

export interface PricedCartLine {
  key: string;
  productId: string;
  slug: string;
  name: string;
  sku: string;
  brand: string;
  image?: { src: string; alt: string };
  options?: Record<string, string>;
  optionsLabel?: string;
  quantity: number;
  minOrderQty: number;
  price: PriceView;
  unit: SellingUnit;
  unitPrice: number | null;
  lineTotal: number | null;
  stock: StockDisplay;
  oversized: boolean;
  /** Reason the line cannot be checked out (still fine for a quote). */
  issue?: string;
}

export interface CartTotals {
  itemCount: number;
  subtotal: number;
  savings: number;
  hasQuoteOnlyItems: boolean;
  hasIssues: boolean;
}

const round = (n: number) => Math.round(n * 100) / 100;

export function cartLineKey(line: Pick<CartLine, "productId" | "options">): string {
  const opts = line.options
    ? Object.entries(line.options)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}=${v}`)
        .join("&")
    : "";
  return `${line.productId}${opts ? `?${opts}` : ""}`;
}

export function optionsLabel(product: Product, options?: Record<string, string>): string | undefined {
  if (!options) return undefined;
  const parts = product.variants
    .map((g) => g.options.find((o) => o.value === options[g.name])?.label)
    .filter(Boolean);
  return parts.length ? parts.join(" · ") : undefined;
}

/** Re-price cart lines on the server for the current viewer. Unknown products are dropped. */
export function priceCartLines(
  lines: CartLine[],
  products: Product[],
  viewer: PricingViewer | null,
): PricedCartLine[] {
  const byId = new Map(products.map((p) => [p.id, p]));
  const out: PricedCartLine[] = [];
  for (const line of lines) {
    const product = byId.get(line.productId);
    if (!product || !product.active) continue;
    const quantity = Math.max(1, Math.min(999, Math.floor(Number(line.quantity) || 1)));
    const price = resolvePrice(product.pricing, viewer, optionAdjustment(product.variants, line.options));
    const stock = describeStock(product.inventory);
    const unitPrice = price.mode === "price" ? price.amount : null;
    const minOrderQty = product.minOrderQty ?? 1;
    let issue: string | undefined;
    if (unitPrice === null) issue = "Price on request — use “Request a quote”";
    else if (!stock.purchasable) issue = "Currently out of stock";
    else if (quantity < minOrderQty) issue = `Minimum order quantity is ${minOrderQty}`;
    out.push({
      key: cartLineKey(line),
      productId: product.id,
      slug: product.slug,
      name: product.name,
      sku: product.sku,
      brand: product.brand,
      image: product.images[0],
      options: line.options,
      optionsLabel: optionsLabel(product, line.options),
      quantity,
      minOrderQty,
      price,
      unit: product.pricing.unit,
      unitPrice,
      lineTotal: unitPrice === null ? null : round(unitPrice * quantity),
      stock,
      oversized: Boolean(product.oversized),
      issue,
    });
  }
  return out;
}

export function cartTotals(lines: PricedCartLine[]): CartTotals {
  let subtotal = 0;
  let savings = 0;
  for (const l of lines) {
    if (l.lineTotal !== null) subtotal += l.lineTotal;
    if (l.price.mode === "price" && l.price.compareAt) savings += (l.price.compareAt - l.price.amount) * l.quantity;
  }
  return {
    itemCount: lines.reduce((n, l) => n + l.quantity, 0),
    subtotal: round(subtotal),
    savings: round(savings),
    hasQuoteOnlyItems: lines.some((l) => l.unitPrice === null),
    hasIssues: lines.some((l) => Boolean(l.issue)),
  };
}

/* ----------------------------------------------------------------------------
 * Delivery
 * ------------------------------------------------------------------------- */

export type DeliveryEstimate =
  | { status: "invalid"; message: string }
  | { status: "outside"; message: string }
  | {
      status: "ok";
      zone: DeliveryZone;
      fee: number;
      feeToBeConfirmed: boolean;
      freeDelivery: boolean;
      message: string;
    };

/** Match a postal code to the most specific active zone prefix. */
export function findDeliveryZone(postalCode: string, zones: DeliveryZone[]): DeliveryZone | undefined {
  const pc = postalCode.replace(/\s/g, "").toUpperCase();
  let best: { zone: DeliveryZone; len: number } | undefined;
  for (const zone of zones) {
    if (!zone.active) continue;
    for (const prefix of zone.postalPrefixes) {
      const p = prefix.replace(/\s/g, "").toUpperCase();
      if (p && pc.startsWith(p) && (!best || p.length > best.len)) best = { zone, len: p.length };
    }
  }
  return best?.zone;
}

export function estimateDelivery(
  postalCode: string,
  lines: Pick<PricedCartLine, "oversized" | "quantity">[],
  subtotal: number,
  settings: Pick<StoreSettings, "deliveryZones" | "oversizedUnitThreshold">,
): DeliveryEstimate {
  const pc = postalCode.replace(/\s/g, "").toUpperCase();
  if (!/^[A-Z]\d[A-Z]\d[A-Z]\d$/.test(pc)) {
    return { status: "invalid", message: "Enter a valid postal code (e.g. L5A 1B2)." };
  }
  const zone = findDeliveryZone(pc, settings.deliveryZones);
  if (!zone) {
    return {
      status: "outside",
      message: "This postal code is outside our regular delivery area. Choose pickup, or request a quote and we'll arrange delivery.",
    };
  }
  const oversizedUnits = lines.filter((l) => l.oversized).reduce((n, l) => n + l.quantity, 0);
  const feeToBeConfirmed = oversizedUnits > settings.oversizedUnitThreshold;
  const freeDelivery = !feeToBeConfirmed && zone.freeOver !== undefined && subtotal >= zone.freeOver;
  const fee = feeToBeConfirmed || freeDelivery ? 0 : zone.fee;
  return {
    status: "ok",
    zone,
    fee,
    feeToBeConfirmed,
    freeDelivery,
    message: feeToBeConfirmed
      ? "Large order — our team will confirm the delivery fee before dispatch. You won't be charged for delivery today."
      : freeDelivery
        ? `Free ${zone.name.toLowerCase()} on this order.`
        : `Estimated delivery: ${zone.leadTime}.`,
  };
}

export function orderTotals(subtotal: number, deliveryFee: number, taxRate: number) {
  const tax = round((subtotal + deliveryFee) * taxRate);
  return { subtotal: round(subtotal), deliveryFee: round(deliveryFee), tax, total: round(subtotal + deliveryFee + tax) };
}
