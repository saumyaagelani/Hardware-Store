import type { AccountType, ContractorStatus, PriceView, ProductPricing, VariantGroup } from "./types";

/** The minimum information pricing needs about whoever is looking. */
export interface PricingViewer {
  accountType: AccountType;
  contractorStatus?: ContractorStatus;
  role?: string;
}

/**
 * Contractor pricing is only ever shown to contractor accounts whose
 * application has been APPROVED. Guests, regular customers, and pending or
 * rejected contractors always fall through to public pricing.
 */
export function canSeeContractorPricing(viewer: PricingViewer | null | undefined): boolean {
  return Boolean(viewer && viewer.accountType === "contractor" && viewer.contractorStatus === "approved");
}

const roundMoney = (n: number) => Math.round(n * 100) / 100;

/**
 * Resolve which price (if any) a viewer should see.
 *
 * - No retail price, or visibility "hidden"  → Request a Quote
 * - visibility "contractors_only"           → quote for everyone except approved contractors
 * - Approved contractor                      → contractor price (or sale price if lower)
 * - Everyone else                            → sale price when set (retail struck through), else retail
 */
export function resolvePrice(
  pricing: ProductPricing,
  viewer: PricingViewer | null | undefined,
  adjustment = 0,
): PriceView {
  const contractor = canSeeContractorPricing(viewer);
  const unit = pricing.unit;

  if (pricing.retail === null || pricing.retail === undefined) {
    return { mode: "quote", reason: "no_price", unit };
  }
  if (pricing.visibility === "hidden") {
    return { mode: "quote", reason: "hidden", unit };
  }
  if (pricing.visibility === "contractors_only" && !contractor) {
    return { mode: "quote", reason: "contractors_only", unit };
  }

  const retail = roundMoney(pricing.retail + adjustment);
  const sale = isActiveSale(pricing) ? roundMoney((pricing.sale as number) + adjustment) : null;

  if (contractor && pricing.contractor !== null && pricing.contractor !== undefined) {
    const contractorPrice = roundMoney(pricing.contractor + adjustment);
    if (sale !== null && sale < contractorPrice) {
      return withSavings({ mode: "price", amount: sale, kind: "sale", compareAt: retail, unit });
    }
    return withSavings({ mode: "price", amount: contractorPrice, kind: "contractor", compareAt: retail, unit });
  }

  if (sale !== null) {
    return withSavings({ mode: "price", amount: sale, kind: "sale", compareAt: retail, unit });
  }
  return { mode: "price", amount: retail, kind: "retail", unit };
}

export function isActiveSale(pricing: ProductPricing, now = new Date()): boolean {
  if (pricing.sale === null || pricing.sale === undefined || pricing.retail === null) return false;
  if (pricing.sale >= pricing.retail) return false;
  if (pricing.saleEndsAt && new Date(pricing.saleEndsAt) < now) return false;
  return true;
}

function withSavings(view: Extract<PriceView, { mode: "price" }>): PriceView {
  if (view.compareAt && view.compareAt > view.amount) {
    return { ...view, savingsPercent: Math.round((1 - view.amount / view.compareAt) * 100) };
  }
  return { ...view, compareAt: undefined };
}

/** Sum of price adjustments for the selected variant options. */
export function optionAdjustment(variants: VariantGroup[], selected: Record<string, string> | undefined): number {
  if (!selected) return 0;
  return variants.reduce((sum, group) => {
    const option = group.options.find((o) => o.value === selected[group.name]);
    return sum + (option?.priceAdjustment ?? 0);
  }, 0);
}

export const unitSuffix: Record<string, string> = {
  each: "",
  box: "/ box",
  sqft: "/ sq. ft.",
  set: "/ set",
  piece: "/ piece",
  pack: "/ pack",
};
