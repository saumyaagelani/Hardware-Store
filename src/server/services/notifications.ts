import "server-only";
import type { Order, Quote, User } from "@/lib/types";
import { business } from "@/config/business";
import { formatMoney } from "@/lib/format";
import { orderStatusMeta, quoteStatusMeta } from "@/lib/status";
import { adminEmail, sendNotification } from "./email";

/** Plain-text notification copy. Swap for HTML templates in Stage 2. */
const signOff = `\n\n— The ${business.name} team\n${business.phone} · ${business.email}`;

export async function notifyAccountRegistered(user: Pick<User, "email" | "fullName" | "id">) {
  await sendNotification(
    "account_registered",
    {
      to: user.email,
      subject: `Welcome to ${business.name}`,
      body: `Hi ${user.fullName.split(" ")[0]},\n\nYour account is ready. You can track orders, quotes and saved addresses from your dashboard.${signOff}`,
    },
    user.id,
  );
}

export async function notifyContractorApplication(user: Pick<User, "email" | "fullName" | "id" | "companyName">) {
  await sendNotification(
    "contractor_application_received",
    {
      to: user.email,
      subject: "We've received your contractor application",
      body: `Hi ${user.fullName.split(" ")[0]},\n\nThanks for applying for a contractor account for ${user.companyName}. Our team usually reviews applications within 1–2 business days. You can shop at retail pricing in the meantime — contractor pricing will appear automatically once you're approved.${signOff}`,
    },
    user.id,
  );
  await sendNotification(
    "contractor_application_admin",
    {
      to: adminEmail(),
      subject: `New contractor application — ${user.companyName}`,
      body: `${user.fullName} (${user.companyName}, ${user.email}) has applied for a contractor account.\n\nReview it in Admin → Contractor applications.`,
    },
    user.id,
  );
}

export async function notifyContractorDecision(user: Pick<User, "email" | "fullName" | "id">, approved: boolean, note?: string) {
  await sendNotification(
    approved ? "contractor_approved" : "contractor_rejected",
    approved
      ? {
          to: user.email,
          subject: "Your contractor account is approved",
          body: `Hi ${user.fullName.split(" ")[0]},\n\nGood news — your contractor account has been approved. Sign in to see contractor pricing on eligible products.${note ? `\n\nNote from our team: ${note}` : ""}${signOff}`,
        }
      : {
          to: user.email,
          subject: "Update on your contractor application",
          body: `Hi ${user.fullName.split(" ")[0]},\n\nUnfortunately we weren't able to approve your contractor application at this time.${note ? `\n\nReason: ${note}` : ""}\n\nYou can continue shopping at retail pricing, or contact us to discuss your application.${signOff}`,
        },
    user.id,
  );
}

export async function notifyQuoteSubmitted(quote: Quote) {
  await sendNotification(
    "quote_received",
    {
      to: quote.contact.email,
      subject: `Quote request received — ${quote.reference}`,
      body: `Hi ${quote.contact.fullName.split(" ")[0]},\n\nThanks for your quote request (${quote.reference}). Our team will review your project and get back to you by ${quote.contact.preferredContact}, usually within one business day.\n\nProject: ${quote.productsRequested || "See details"}\nAddress: ${quote.projectAddress}${signOff}`,
    },
    quote.id,
  );
  await sendNotification(
    "quote_admin",
    {
      to: adminEmail(),
      subject: `New quote request ${quote.reference} — ${quote.contact.fullName}`,
      body: `${quote.contact.fullName} (${quote.customerType}) submitted a quote request.\nItems: ${quote.items.length} · Files: ${quote.fileIds.length}\nInstallation: ${quote.installationRequired ? "Yes" : "No"} · ${quote.fulfilment}\n\nOpen Admin → Quote requests to review.`,
    },
    quote.id,
  );
}

export async function notifyQuoteStatus(quote: Quote, note?: string) {
  const meta = quoteStatusMeta[quote.status];
  await sendNotification(
    "quote_status",
    {
      to: quote.contact.email,
      subject: `Quote ${quote.reference}: ${meta.label}`,
      body: `Hi ${quote.contact.fullName.split(" ")[0]},\n\n${meta.description}${quote.quotedAmount && quote.status === "quoted" ? `\n\nQuoted total: ${formatMoney(quote.quotedAmount)} + tax` : ""}${note ? `\n\n${note}` : ""}${signOff}`,
    },
    quote.id,
  );
}

export async function notifyOrderPlaced(order: Order) {
  const lines = order.items.map((i) => `• ${i.quantity} × ${i.name}${i.optionsLabel ? ` (${i.optionsLabel})` : ""} — ${formatMoney(i.lineTotal)}`).join("\n");
  await sendNotification(
    "order_confirmation",
    {
      to: order.customer.email,
      subject: `Order confirmed — ${order.number}`,
      body: `Hi ${order.customer.fullName.split(" ")[0]},\n\nThank you for your order!\n\n${lines}\n\nTotal: ${formatMoney(order.total)}\n${order.fulfilment.method === "pickup" ? `Pickup: ${order.fulfilment.locationName} — ${order.fulfilment.readyEstimate}` : `Delivery to ${order.fulfilment.address.line1}, ${order.fulfilment.address.city}`}${order.payment.method === "etransfer" ? `\n\nPlease send your Interac e-Transfer of ${formatMoney(order.total)} to ${business.email} with ${order.number} in the message.` : ""}${signOff}`,
    },
    order.id,
  );
  await sendNotification(
    "order_admin",
    {
      to: adminEmail(),
      subject: `New order ${order.number} — ${formatMoney(order.total)}`,
      body: `${order.customer.fullName}${order.guest ? " (guest)" : ""} placed order ${order.number} for ${formatMoney(order.total)} (${order.fulfilment.method}).`,
    },
    order.id,
  );
}

export async function notifyOrderStatus(order: Order) {
  await sendNotification(
    "order_status",
    {
      to: order.customer.email,
      subject: `Order ${order.number}: ${orderStatusMeta[order.status].label}`,
      body: `Hi ${order.customer.fullName.split(" ")[0]},\n\nYour order ${order.number} is now “${orderStatusMeta[order.status].label}”.${signOff}`,
    },
    order.id,
  );
}
