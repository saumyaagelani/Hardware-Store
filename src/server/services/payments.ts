import "server-only";
import type { PaymentMethod, PaymentStatus } from "@/lib/types";

/**
 * PAYMENTS
 * -----------------------------------------------------------------------------
 * The checkout never sends raw card numbers to this server. In the prototype
 * the browser "tokenises" test cards into demo tokens (lib/demo-card.ts); in
 * production this is replaced by the payment provider's hosted fields (e.g.
 * Stripe Payment Element, which also provides Apple Pay / Google Pay) and the
 * server confirms a PaymentIntent using STRIPE_SECRET_KEY from the environment.
 */
export interface ChargeRequest {
  amount: number;
  currency: string;
  method: PaymentMethod;
  token?: string;
  description: string;
}

export interface ChargeResult {
  status: PaymentStatus;
  reference: string;
  message?: string;
  cardBrand?: string;
  last4?: string;
}

export interface PaymentProvider {
  name: string;
  charge(request: ChargeRequest): Promise<ChargeResult>;
}

const demoProvider: PaymentProvider = {
  name: "demo",
  async charge(req) {
    const reference = `demo_pi_${crypto.randomUUID().slice(0, 12)}`;
    if (req.method === "etransfer") {
      return { status: "awaiting_payment", reference };
    }
    if (req.method === "apple_pay" || req.method === "google_pay") {
      return { status: "paid", reference };
    }
    // Card token format: demo_tok_<outcome>_<brand>_<last4>
    const match = /^demo_tok_(ok|decline|insufficient)_([a-z]+)_(\d{4})$/.exec(req.token ?? "");
    if (!match) return { status: "failed", reference, message: "Card details could not be verified. Please try again." };
    const [, outcome, brand, last4] = match;
    const cardBrand = brand.charAt(0).toUpperCase() + brand.slice(1);
    if (outcome === "decline") {
      return { status: "failed", reference, cardBrand, last4, message: "Your card was declined. Please use a different card or payment method." };
    }
    if (outcome === "insufficient") {
      return { status: "failed", reference, cardBrand, last4, message: "Insufficient funds. Please use a different card or payment method." };
    }
    return { status: "paid", reference, cardBrand, last4 };
  },
};

export function getPaymentProvider(): PaymentProvider {
  // Stage 2: return a Stripe (or Moneris/Helcim/Square) provider when configured.
  return demoProvider;
}
