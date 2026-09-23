import type { ContractorStatus, OrderStatus, PaymentStatus, QuoteStatus } from "./types";

export type Tone = "neutral" | "info" | "warning" | "success" | "danger" | "special" | "gold";

export const quoteStatusMeta: Record<QuoteStatus, { label: string; tone: Tone; description: string }> = {
  submitted: { label: "Submitted", tone: "info", description: "We've received your request." },
  under_review: { label: "Under Review", tone: "gold", description: "Our team is preparing your quote." },
  info_required: {
    label: "Additional Info Required",
    tone: "warning",
    description: "We need a little more information to finish your quote.",
  },
  quoted: { label: "Quoted", tone: "special", description: "Your quote is ready to review." },
  approved: { label: "Approved", tone: "success", description: "Quote approved — we'll be in touch to schedule." },
  declined: { label: "Declined", tone: "danger", description: "This quote was declined or has expired." },
};

export const quoteStatusOrder: QuoteStatus[] = [
  "submitted",
  "under_review",
  "info_required",
  "quoted",
  "approved",
  "declined",
];

export const orderStatusMeta: Record<OrderStatus, { label: string; tone: Tone }> = {
  awaiting_payment: { label: "Awaiting Payment", tone: "warning" },
  processing: { label: "Processing", tone: "info" },
  ready_for_pickup: { label: "Ready for Pickup", tone: "gold" },
  out_for_delivery: { label: "Out for Delivery", tone: "special" },
  completed: { label: "Completed", tone: "success" },
  cancelled: { label: "Cancelled", tone: "danger" },
};

export const orderStatusOrder: OrderStatus[] = [
  "awaiting_payment",
  "processing",
  "ready_for_pickup",
  "out_for_delivery",
  "completed",
  "cancelled",
];

export const paymentStatusMeta: Record<PaymentStatus, { label: string; tone: Tone }> = {
  paid: { label: "Paid", tone: "success" },
  awaiting_payment: { label: "Awaiting e-Transfer", tone: "warning" },
  failed: { label: "Failed", tone: "danger" },
  refunded: { label: "Refunded", tone: "neutral" },
};

export const contractorStatusMeta: Record<ContractorStatus, { label: string; tone: Tone; description: string }> = {
  pending: {
    label: "Pending Review",
    tone: "warning",
    description: "Your application is being reviewed. Contractor pricing unlocks once approved.",
  },
  approved: {
    label: "Approved",
    tone: "success",
    description: "Contractor pricing is applied automatically whenever you're signed in.",
  },
  rejected: {
    label: "Not Approved",
    tone: "danger",
    description: "We couldn't approve this application. You can still shop at retail pricing.",
  },
};
