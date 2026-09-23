/**
 * DEMO CARD "TOKENISER" — runs in the browser only.
 * Mimics what a real provider's hosted card field does: validates the card
 * and returns an opaque token so the raw number never reaches our server.
 *
 * Test cards:
 *   4242 4242 4242 4242  → approved (Visa)
 *   5555 5555 5555 4444  → approved (Mastercard)
 *   3782 822463 10005    → approved (Amex)
 *   4000 0000 0000 0002  → declined
 *   4000 0000 0000 9995  → insufficient funds
 */
export type CardBrand = "visa" | "mastercard" | "amex" | "unknown";

export function detectBrand(number: string): CardBrand {
  const n = number.replace(/\D/g, "");
  if (/^4/.test(n)) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(n)) return "mastercard";
  if (/^3[47]/.test(n)) return "amex";
  return "unknown";
}

export function luhnValid(number: string): boolean {
  const digits = number.replace(/\D/g, "");
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = Number(digits[i]);
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return sum % 10 === 0;
}

export function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 19);
  if (detectBrand(digits) === "amex") {
    return [digits.slice(0, 4), digits.slice(4, 10), digits.slice(10, 15)].filter(Boolean).join(" ");
  }
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

export function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)} / ${digits.slice(2)}` : digits;
}

export interface CardInput {
  number: string;
  expiry: string;
  cvc: string;
  name: string;
}

export type TokenResult = { ok: true; token: string; brand: CardBrand; last4: string } | { ok: false; errors: Partial<Record<keyof CardInput, string>> };

export function tokenizeDemoCard(input: CardInput, now = new Date()): TokenResult {
  const errors: Partial<Record<keyof CardInput, string>> = {};
  const digits = input.number.replace(/\D/g, "");
  const brand = detectBrand(digits);
  if (!luhnValid(digits) || brand === "unknown") errors.number = "Enter a valid Visa, Mastercard or American Express number";

  const exp = input.expiry.replace(/\D/g, "");
  const month = Number(exp.slice(0, 2));
  const year = 2000 + Number(exp.slice(2, 4));
  if (exp.length !== 4 || month < 1 || month > 12) errors.expiry = "Enter a valid expiry (MM / YY)";
  else if (new Date(year, month, 1) <= new Date(now.getFullYear(), now.getMonth(), 1)) errors.expiry = "This card has expired";

  const cvcLength = brand === "amex" ? 4 : 3;
  if (!new RegExp(`^\\d{${cvcLength}}$`).test(input.cvc)) errors.cvc = `Enter the ${cvcLength}-digit security code`;
  if (!input.name.trim()) errors.name = "Enter the name on the card";

  if (Object.keys(errors).length) return { ok: false, errors };
  const last4 = digits.slice(-4);
  const outcome = digits === "4000000000000002" ? "decline" : digits === "4000000000009995" ? "insufficient" : "ok";
  return { ok: true, token: `demo_tok_${outcome}_${brand}_${last4}`, brand, last4 };
}
