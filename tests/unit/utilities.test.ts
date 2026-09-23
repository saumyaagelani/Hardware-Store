import { describe, expect, it } from "vitest";
import { calculateCoverage, roomsArea } from "@/lib/calculator";
import { formatQuoteReference, nextOrderNumber, nextQuoteReference } from "@/lib/quote-ref";
import { describeStock, statusFromQuantity } from "@/lib/stock";
import { contactSchema, normalizePostalCode, quoteSchema, registerSchema } from "@/lib/validation";
import { luhnValid, tokenizeDemoCard } from "@/lib/demo-card";
import { validateUploadClient } from "@/lib/uploads";

describe("square-footage calculator", () => {
  it("adds waste allowance and rounds up to whole units", () => {
    expect(calculateCoverage(120, 10, 23.64)).toEqual({ area: 120, areaWithWaste: 132, units: 6, coverage: 141.84, overage: 21.84 });
    expect(calculateCoverage(100, 0, 20).units).toBe(5); // exact fit is not rounded up
    expect(calculateCoverage(100, 5, 20).units).toBe(6);
    expect(calculateCoverage(100, 15, 20).units).toBe(6);
  });
  it("handles empty or invalid input", () => {
    expect(calculateCoverage(0, 10, 20).units).toBe(0);
    expect(calculateCoverage(100, 10, 0).units).toBe(0);
  });
  it("sums rooms and converts metres", () => {
    expect(roomsArea([{ length: 12, width: 10 }, { length: 5, width: 4 }])).toBe(140);
    expect(roomsArea([{ length: 0, width: 10 }])).toBe(0);
    expect(roomsArea([{ length: 4, width: 3 }], "m")).toBeCloseTo(129.17, 1);
  });
});

describe("quote references", () => {
  it("formats Q-YYYY-NNNN", () => {
    expect(formatQuoteReference(2026, 1)).toBe("Q-2026-0001");
    expect(formatQuoteReference(2026, 1234)).toBe("Q-2026-1234");
  });
  it("increments per year without mutating input and never repeats", () => {
    const counters = { quoteByYear: { "2026": 9 }, order: 1 };
    const a = nextQuoteReference(counters, new Date("2026-05-01"));
    const b = nextQuoteReference(a.counters, new Date("2026-05-01"));
    expect(a.reference).toBe("Q-2026-0010");
    expect(b.reference).toBe("Q-2026-0011");
    expect(counters.quoteByYear["2026"]).toBe(9);
    expect(nextQuoteReference(b.counters, new Date("2027-01-02")).reference).toBe("Q-2027-0001");
  });
  it("increments order numbers", () => {
    expect(nextOrderNumber({ quoteByYear: {}, order: 10250 }).number).toBe("NL-10251");
  });
});

describe("inventory states", () => {
  const inv = { quantity: 5, lowStockThreshold: 10 };
  it("describes each state with purchasability", () => {
    expect(describeStock({ ...inv, status: "in_stock" })).toMatchObject({ label: "In Stock", purchasable: true });
    expect(describeStock({ ...inv, status: "low_stock" })).toMatchObject({ label: "Low Stock", detail: "Only 5 left", purchasable: true });
    expect(describeStock({ ...inv, status: "special_order", leadTime: "2 weeks" })).toMatchObject({ label: "Special Order", detail: "Ships in 2 weeks" });
    const out = describeStock({ ...inv, quantity: 0, status: "out_of_stock", restockDate: "2026-10-05T00:00:00Z" });
    expect(out).toMatchObject({ label: "Out of Stock", purchasable: false });
    expect(out.detail).toContain("Expected restock");
  });
  it("derives status from quantity but keeps special order", () => {
    expect(statusFromQuantity(0, 10, "in_stock")).toBe("out_of_stock");
    expect(statusFromQuantity(4, 10, "in_stock")).toBe("low_stock");
    expect(statusFromQuantity(40, 10, "low_stock")).toBe("in_stock");
    expect(statusFromQuantity(0, 10, "special_order")).toBe("special_order");
  });
});

describe("form validation", () => {
  it("normalises Canadian postal codes", () => {
    expect(normalizePostalCode("l5a1b2")).toBe("L5A 1B2");
  });
  it("rejects mismatched passwords and invalid postal codes on registration", () => {
    const res = registerSchema.safeParse({
      fullName: "Test Person",
      email: "t@example.com",
      phone: "555 010 0000",
      password: "abc12345",
      confirmPassword: "different1",
      preferredContact: "email",
      billing: { line1: "1 Main", city: "Town", province: "ON", postalCode: "99999" },
      sameDelivery: true,
    });
    expect(res.success).toBe(false);
    const paths = res.error!.issues.map((i) => i.path.join("."));
    expect(paths).toContain("confirmPassword");
    expect(paths).toContain("billing.postalCode");
  });
  it("requires contact details on quotes", () => {
    const res = quoteSchema.safeParse({ fullName: "", email: "bad", phone: "x", projectAddress: "", customerType: "homeowner", installationRequired: "no", fulfilment: "pickup", preferredContact: "email" });
    expect(res.success).toBe(false);
    expect(res.error!.issues.map((i) => i.path[0])).toEqual(expect.arrayContaining(["fullName", "email", "phone", "projectAddress"]));
  });
  it("requires a meaningful contact message", () => {
    expect(contactSchema.safeParse({ name: "A", email: "a@example.com", topic: "Other", message: "hi" }).success).toBe(false);
  });
});

describe("demo payments & uploads", () => {
  it("validates cards with Luhn and tokenises outcomes", () => {
    expect(luhnValid("4242 4242 4242 4242")).toBe(true);
    expect(luhnValid("4242 4242 4242 4241")).toBe(false);
    const now = new Date("2026-09-23");
    expect(tokenizeDemoCard({ number: "4242424242424242", expiry: "12 / 30", cvc: "123", name: "A" }, now)).toMatchObject({ ok: true, token: "demo_tok_ok_visa_4242" });
    expect(tokenizeDemoCard({ number: "4000000000000002", expiry: "12/30", cvc: "123", name: "A" }, now)).toMatchObject({ ok: true, token: "demo_tok_decline_visa_0002" });
    const expired = tokenizeDemoCard({ number: "4242424242424242", expiry: "01/20", cvc: "1", name: "" }, now);
    expect(expired.ok).toBe(false);
    if (!expired.ok) expect(Object.keys(expired.errors).sort()).toEqual(["cvc", "expiry", "name"]);
  });
  it("restricts upload types and sizes", () => {
    expect(validateUploadClient({ name: "plan.pdf", size: 1000 })).toBeNull();
    expect(validateUploadClient({ name: "photo.JPG", size: 1000 })).toBeNull();
    expect(validateUploadClient({ name: "script.exe", size: 1000 })).toMatch(/supported/);
    expect(validateUploadClient({ name: "huge.png", size: 11 * 1024 * 1024 })).toMatch(/10 MB/);
  });
});
