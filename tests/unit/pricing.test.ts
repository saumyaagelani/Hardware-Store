import { describe, expect, it } from "vitest";
import { canSeeContractorPricing, isActiveSale, optionAdjustment, resolvePrice, type PricingViewer } from "@/lib/pricing";
import type { ProductPricing } from "@/lib/types";

const base: ProductPricing = { retail: 100, sale: null, contractor: 80, visibility: "public", unit: "each" };

const viewers: Record<string, PricingViewer | null> = {
  guest: null,
  regular: { accountType: "regular" },
  pending: { accountType: "contractor", contractorStatus: "pending" },
  rejected: { accountType: "contractor", contractorStatus: "rejected" },
  approved: { accountType: "contractor", contractorStatus: "approved" },
  contractorNoStatus: { accountType: "contractor" },
  adminRegular: { accountType: "regular", role: "admin" },
};

describe("contractor authorization", () => {
  it("only approved contractors can see contractor pricing", () => {
    expect(canSeeContractorPricing(viewers.approved)).toBe(true);
    for (const key of ["guest", "regular", "pending", "rejected", "contractorNoStatus", "adminRegular"]) {
      expect(canSeeContractorPricing(viewers[key]), key).toBe(false);
    }
  });

  it("never returns a contractor price to anyone except approved contractors", () => {
    for (const [key, viewer] of Object.entries(viewers)) {
      const view = resolvePrice(base, viewer);
      if (key === "approved") {
        expect(view).toMatchObject({ mode: "price", kind: "contractor", amount: 80, compareAt: 100, savingsPercent: 20 });
      } else {
        expect(view, key).toEqual({ mode: "price", kind: "retail", amount: 100, unit: "each" });
      }
    }
  });
});

describe("resolvePrice", () => {
  it("shows retail struck through with a sale price", () => {
    const view = resolvePrice({ ...base, sale: 75 }, null);
    expect(view).toMatchObject({ mode: "price", kind: "sale", amount: 75, compareAt: 100, savingsPercent: 25 });
  });

  it("gives approved contractors the sale price when it is lower than their contractor price", () => {
    expect(resolvePrice({ ...base, sale: 70 }, viewers.approved)).toMatchObject({ kind: "sale", amount: 70 });
    expect(resolvePrice({ ...base, sale: 90 }, viewers.approved)).toMatchObject({ kind: "contractor", amount: 80 });
  });

  it("falls back to retail for approved contractors when no contractor price is set", () => {
    expect(resolvePrice({ ...base, contractor: null }, viewers.approved)).toMatchObject({ kind: "retail", amount: 100 });
  });

  it("returns Request a Quote when there is no fixed price", () => {
    expect(resolvePrice({ ...base, retail: null }, viewers.approved)).toEqual({ mode: "quote", reason: "no_price", unit: "each" });
  });

  it("hides prices from everyone when visibility is hidden", () => {
    for (const viewer of Object.values(viewers)) {
      expect(resolvePrice({ ...base, visibility: "hidden" }, viewer).mode).toBe("quote");
    }
  });

  it("shows contractors_only prices to approved contractors only", () => {
    const pricing = { ...base, visibility: "contractors_only" as const };
    expect(resolvePrice(pricing, viewers.approved)).toMatchObject({ mode: "price", kind: "contractor" });
    for (const key of ["guest", "regular", "pending", "rejected"]) {
      expect(resolvePrice(pricing, viewers[key]), key).toEqual({ mode: "quote", reason: "contractors_only", unit: "each" });
    }
  });

  it("ignores expired or invalid sale prices", () => {
    expect(isActiveSale({ ...base, sale: 90, saleEndsAt: "2000-01-01T00:00:00Z" })).toBe(false);
    expect(isActiveSale({ ...base, sale: 120 })).toBe(false);
    expect(resolvePrice({ ...base, sale: 90, saleEndsAt: "2000-01-01T00:00:00Z" }, null)).toMatchObject({ kind: "retail", amount: 100 });
  });

  it("applies variant price adjustments to every tier", () => {
    const adjustment = optionAdjustment([{ name: "Width", options: [{ value: "36", label: '36"', priceAdjustment: 25 }] }], { Width: "36" });
    expect(adjustment).toBe(25);
    expect(resolvePrice({ ...base, sale: 90 }, null, adjustment)).toMatchObject({ amount: 115, compareAt: 125 });
    expect(resolvePrice(base, viewers.approved, adjustment)).toMatchObject({ amount: 105, compareAt: 125 });
  });
});
