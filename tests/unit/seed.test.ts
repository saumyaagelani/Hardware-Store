import { describe, expect, it } from "vitest";
import { createSeedDatabase } from "@/data/seed";
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "@/data/seed/people";
import { verifyPassword } from "@/server/auth/password";

const db = createSeedDatabase(new Date("2026-09-23T12:00:00Z"));

describe("demo data integrity", () => {
  it("has unique product ids, slugs and SKUs", () => {
    for (const key of ["id", "slug", "sku"] as const) {
      const values = db.products.map((p) => p[key]);
      expect(new Set(values).size, key).toBe(values.length);
    }
  });

  it("covers every category and every important product state", () => {
    const cats = new Set(db.products.map((p) => p.categoryId));
    expect(db.categories.every((c) => cats.has(c.id))).toBe(true);
    const statuses = new Set(db.products.map((p) => p.inventory.status));
    expect([...statuses].sort()).toEqual(["in_stock", "low_stock", "out_of_stock", "special_order"]);
    expect(db.products.some((p) => p.pricing.retail === null)).toBe(true);
    expect(db.products.some((p) => p.pricing.sale !== null)).toBe(true);
    expect(db.products.some((p) => p.pricing.visibility === "contractors_only")).toBe(true);
    expect(db.products.some((p) => p.variants.length)).toBe(true);
    expect(db.products.some((p) => p.coverage)).toBe(true);
  });

  it("only references products that exist", () => {
    const ids = new Set(db.products.map((p) => p.id));
    for (const p of db.products) {
      for (const id of [...p.relatedIds, ...p.accessoryIds]) expect(ids.has(id), `${p.slug} → ${id}`).toBe(true);
      expect(db.categories.find((c) => c.id === p.categoryId)?.subcategories.some((s) => s.slug === p.subcategory) ?? true).toBe(true);
    }
  });

  it("seeds demo accounts in every contractor state with hashed passwords", () => {
    for (const account of DEMO_ACCOUNTS) {
      const user = db.users.find((u) => u.id === account.userId)!;
      expect(user.email).toBe(account.email);
      expect(user.passwordHash).not.toContain(DEMO_PASSWORD);
      expect(verifyPassword(DEMO_PASSWORD, user.passwordHash)).toBe(true);
      expect(verifyPassword("wrong-password1", user.passwordHash)).toBe(false);
    }
    const statuses = db.users.filter((u) => u.accountType === "contractor").map((u) => u.contractorStatus);
    expect(new Set(statuses)).toEqual(new Set(["approved", "pending", "rejected"]));
  });

  it("seeds orders and quotes with sequential unique references", () => {
    const refs = db.quotes.map((q) => q.reference);
    expect(new Set(refs).size).toBe(refs.length);
    expect(refs.every((r) => /^Q-\d{4}-\d{4}$/.test(r))).toBe(true);
    const numbers = db.orders.map((o) => o.number);
    expect(new Set(numbers).size).toBe(numbers.length);
    expect(db.counters.quoteByYear["2026"]).toBe(db.quotes.length);
  });
});
