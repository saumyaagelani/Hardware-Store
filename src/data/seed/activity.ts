/**
 * Demo orders, quotes, uploads, contact messages and notification history so
 * the customer and admin dashboards look lived-in during the presentation.
 */
import type {
  Address,
  ContactSubmission,
  EmailLogEntry,
  Order,
  OrderStatus,
  PaymentMethod,
  Product,
  Quote,
  QuoteStatus,
  UploadedFile,
  User,
} from "@/lib/types";
import { formatQuoteReference } from "@/lib/quote-ref";
import { quoteStatusOrder } from "@/lib/status";

const TAX_RATE = 0.13;
const round = (n: number) => Math.round(n * 100) / 100;

interface OrderDef {
  userId?: string;
  guest?: { fullName: string; email: string; phone: string; address: Address };
  daysAgo: number;
  items: [string, number, string?][];
  method: "pickup" | "delivery";
  status: OrderStatus;
  payment: PaymentMethod;
  deliveryFee?: number;
  tbc?: boolean;
}

export function buildActivity(products: Product[], users: User[], now = new Date()) {
  const byKey = new Map(products.map((p) => [p.id.replace("prd_", ""), p]));
  const userById = new Map(users.map((u) => [u.id, u]));
  const at = (days: number, hours = 10) => new Date(now.getTime() - days * 86400000 - hours * 3600000).toISOString();

  /* ------------------------------- Orders ------------------------------ */
  const orderDefs: OrderDef[] = [
    { userId: "usr_customer", daysAgo: 41, items: [["harbour-oak-spc", 14], ["t-moulding", 2, "Harbour Oak"], ["quarter-round", 12]], method: "delivery", status: "completed", payment: "card", deliveryFee: 79 },
    { userId: "usr_customer", daysAgo: 16, items: [["lever-privacy-set", 3, "Matte Black"], ["lever-passage-set", 5, "Matte Black"]], method: "pickup", status: "completed", payment: "apple_pay" },
    { userId: "usr_customer", daysAgo: 2, items: [["shaker-vanity-30", 1, "Harbour Navy"], ["led-mirror-30", 1], ["braided-supply-line", 1], ["p-trap-kit", 1]], method: "delivery", status: "processing", payment: "card", deliveryFee: 79 },
    { userId: "usr_contractor_approved", daysAgo: 25, items: [["coastline-spc", 38, "Driftwood Grey"], ["flush-stair-nosing", 6, "Driftwood Grey"], ["t-moulding", 4, "Driftwood Grey"]], method: "delivery", status: "completed", payment: "card", deliveryFee: 0, tbc: true },
    { userId: "usr_contractor_approved", daysAgo: 6, items: [["shower-base-60x32", 2, "Left drain"], ["frameless-slider-60", 2, "Matte Black"], ["rainfall-shower-system", 2]], method: "delivery", status: "out_for_delivery", payment: "card", deliveryFee: 119 },
    { userId: "usr_contractor_approved", daysAgo: 1, items: [["pex-a-coil", 4, "Red (hot)"], ["pex-a-coil", 4, "Blue (cold)"], ["shutoff-valve", 12]], method: "pickup", status: "ready_for_pickup", payment: "etransfer" },
    { userId: "usr_hannah", daysAgo: 12, items: [["soft-close-elongated", 24], ["lever-passage-set", 20, "Satin Nickel"]], method: "delivery", status: "completed", payment: "card", deliveryFee: 79 },
    { userId: "usr_chris", daysAgo: 9, items: [["modern-barn-door-kit", 1], ["barn-door-pull", 1]], method: "pickup", status: "completed", payment: "google_pay" },
    { userId: "usr_aisha", daysAgo: 0, items: [["fluted-wpc-panel", 14, "Charcoal"], ["wpc-trim", 4], ["panel-adhesive", 8]], method: "delivery", status: "processing", payment: "card", deliveryFee: 79 },
    {
      guest: { fullName: "Morgan Ellis", email: "morgan.ellis@example.com", phone: "(555) 010-1180", address: { line1: "3 Guest Road", city: "Your City", province: "ON", postalCode: "L5N 2B1", country: "Canada" } },
      daysAgo: 4,
      items: [["urban-concrete-tile", 10], ["flooring-install-kit", 1]],
      method: "delivery",
      status: "processing",
      payment: "card",
      deliveryFee: 79,
    },
    {
      guest: { fullName: "Riley Chen", email: "riley.chen@example.com", phone: "(555) 010-1291", address: { line1: "70 Visitor Ave", city: "Your City", province: "ON", postalCode: "M6P 1K2", country: "Canada" } },
      daysAgo: 0,
      items: [["smart-keypad-deadbolt", 1]],
      method: "pickup",
      status: "awaiting_payment",
      payment: "etransfer",
    },
    { userId: "usr_chris", daysAgo: 30, items: [["soft-close-round", 2]], method: "pickup", status: "cancelled", payment: "card" },
  ];

  let orderSeq = 10200;
  const orders: Order[] = orderDefs
    .sort((a, b) => b.daysAgo - a.daysAgo)
    .map((def, i) => {
      orderSeq += 7 + (i % 3);
      const user = def.userId ? userById.get(def.userId) : undefined;
      const contractor = user?.accountType === "contractor" && user.contractorStatus === "approved";
      const items = def.items
        .map(([key, qty, optionsLabel]) => {
          const p = byKey.get(key)!;
          const retail = p.pricing.retail ?? 0;
          const unitPrice = contractor && p.pricing.contractor ? p.pricing.contractor : (p.pricing.sale ?? retail);
          const priceKind = contractor && p.pricing.contractor ? "contractor" : p.pricing.sale ? "sale" : "retail";
          return {
            productId: p.id,
            name: p.name,
            sku: p.sku,
            optionsLabel,
            quantity: qty,
            unitPrice,
            priceKind,
            unit: p.pricing.unit,
            lineTotal: round(unitPrice * qty),
          } as Order["items"][number];
        });
      const subtotal = round(items.reduce((s, it) => s + it.lineTotal, 0));
      const deliveryFee = def.method === "delivery" ? (def.deliveryFee ?? 0) : 0;
      const tax = round((subtotal + deliveryFee) * TAX_RATE);
      const customer = user
        ? { fullName: user.fullName, email: user.email, phone: user.phone, companyName: user.companyName }
        : { fullName: def.guest!.fullName, email: def.guest!.email, phone: def.guest!.phone };
      const address = user?.deliveryAddresses[0] ?? user?.billingAddress ?? def.guest!.address;
      const created = at(def.daysAgo, 3 + (i % 6));
      const midStep: OrderStatus = def.method === "pickup" ? "ready_for_pickup" : "out_for_delivery";
      const flowByStatus: Record<OrderStatus, OrderStatus[]> = {
        awaiting_payment: ["awaiting_payment"],
        processing: ["processing"],
        ready_for_pickup: ["processing", "ready_for_pickup"],
        out_for_delivery: ["processing", "out_for_delivery"],
        completed: ["processing", midStep, "completed"],
        cancelled: ["processing", "cancelled"],
      };
      const flow = flowByStatus[def.status];
      return {
        id: `ord_${orderSeq}`,
        number: `NL-${orderSeq}`,
        createdAt: created,
        userId: def.userId,
        guest: !def.userId,
        customer,
        billingAddress: user?.billingAddress ?? address,
        fulfilment:
          def.method === "pickup"
            ? { method: "pickup", locationId: "pickup_main", locationName: "Main Showroom & Warehouse", readyEstimate: "Within 2 business hours" }
            : {
                method: "delivery",
                address,
                zoneId: "zone_local",
                zoneName: "Local Delivery",
                feeToBeConfirmed: Boolean(def.tbc),
              },
        items,
        subtotal,
        deliveryFee,
        taxRate: TAX_RATE,
        taxLabel: "HST (13%)",
        tax,
        total: round(subtotal + deliveryFee + tax),
        payment: {
          method: def.payment,
          status: def.payment === "etransfer" && def.status === "awaiting_payment" ? "awaiting_payment" : def.status === "cancelled" ? "refunded" : "paid",
          provider: "demo",
          reference: `demo_pi_${orderSeq}`,
          cardBrand: def.payment === "card" ? (i % 2 ? "Visa" : "Mastercard") : undefined,
          last4: def.payment === "card" ? (i % 2 ? "4242" : "4444") : undefined,
        },
        status: def.status,
        history: flow.map((status, j) => ({ status, at: new Date(new Date(created).getTime() + j * 86400000).toISOString(), by: j ? "Taylor Kim" : "System" })),
      } satisfies Order;
    });

  /* --------------------------- Uploaded files -------------------------- */
  const uploads: UploadedFile[] = [
    { id: "upl_demo_1", originalName: "kitchen-floor-plan.pdf", mimeType: "application/pdf", sizeBytes: 482113, uploadedAt: at(20), userId: "usr_customer", quoteId: "qte_1", demo: true },
    { id: "upl_demo_2", originalName: "basement-before-photo.jpg", mimeType: "image/jpeg", sizeBytes: 2213042, uploadedAt: at(20), userId: "usr_customer", quoteId: "qte_1", demo: true },
    { id: "upl_demo_3", originalName: "ensuite-measurements.pdf", mimeType: "application/pdf", sizeBytes: 211553, uploadedAt: at(3), userId: "usr_customer", quoteId: "qte_6", demo: true },
    { id: "upl_demo_4", originalName: "maple-row-unit-layouts.pdf", mimeType: "application/pdf", sizeBytes: 1733920, uploadedAt: at(8), userId: "usr_contractor_approved", quoteId: "qte_3", demo: true },
    { id: "upl_demo_5", originalName: "staircase-photo.png", mimeType: "image/png", sizeBytes: 1402221, uploadedAt: at(1), quoteId: "qte_9", demo: true },
  ];

  /* ------------------------------- Quotes ------------------------------ */
  interface QuoteDef {
    userId?: string;
    contact?: Quote["contact"];
    customerType: Quote["customerType"];
    daysAgo: number;
    status: QuoteStatus;
    source: Quote["source"];
    project: string;
    requested: string;
    items?: [string, string, string?][];
    styles?: string;
    measurements?: string;
    install: boolean;
    fulfilment: "delivery" | "pickup";
    details?: string;
    files?: string[];
    amount?: number;
    notes?: string;
  }

  const quoteDefs: QuoteDef[] = [
    { userId: "usr_customer", customerType: "homeowner", daysAgo: 20, status: "approved", source: "form", project: "48 Sample Crescent, Your City, ON", requested: "Vinyl flooring for finished basement plus stair refacing", items: [["harbour-oak-spc", "32 boxes"], ["stair-refacing-package", "13 steps"]], styles: "Light natural oak, matte", measurements: "Basement approx. 680 sq. ft.; 13 stairs", install: true, fulfilment: "delivery", details: "Would like installation booked before the holidays if possible.", files: ["upl_demo_1", "upl_demo_2"], amount: 6840, notes: "Installer booked — crew B." },
    { userId: "usr_hannah", customerType: "business", daysAgo: 15, status: "quoted", source: "cart", project: "500 Commerce Blvd — Units 2 & 5", requested: "Turnover package for two rental units", items: [["maple-mist-lvp", "40 boxes"], ["soft-close-elongated", "4"], ["compact-wall-vanity-24", "2"]], install: false, fulfilment: "delivery", amount: 4312.5 },
    { userId: "usr_contractor_approved", customerType: "contractor", daysAgo: 8, status: "under_review", source: "form", project: "7 Maple Row, Your City, ON", requested: "Six-unit townhouse bathroom package", items: [["shower-base-60x32", "6", "Left drain"], ["frameless-slider-60", "6", "Matte Black"], ["shaker-vanity-30", "6", "Classic White"]], styles: "Matte black fixtures, white vanities", install: false, fulfilment: "delivery", details: "Staggered delivery over 3 weeks preferred.", files: ["upl_demo_4"] },
    { contact: { fullName: "Sofia Martins", email: "sofia.martins@example.com", phone: "(555) 010-1402", preferredContact: "text" }, customerType: "homeowner", daysAgo: 5, status: "info_required", source: "product", project: "Lakeside, ON", requested: "Custom glass shower enclosure with knee wall", items: [["custom-glass-enclosure", "1"]], measurements: "Opening approx. 58\" x 78\", knee wall 36\"", install: true, fulfilment: "delivery", notes: "Asked customer for photos of the knee wall and ceiling height." },
    { contact: { fullName: "Owen Park", email: "owen.park@example.com", phone: "(555) 010-1533", preferredContact: "email" }, customerType: "designer", daysAgo: 4, status: "submitted", source: "form", project: "Downtown condo — Unit 1804", requested: "Fluted feature wall + floating vanity", items: [["fluted-wpc-panel", "22 panels", "Walnut"], ["floating-oak-vanity-36", "1"]], styles: "Warm walnut, minimal", install: false, fulfilment: "pickup" },
    { userId: "usr_customer", customerType: "homeowner", daysAgo: 3, status: "submitted", source: "cart", project: "12 Cottage Lane, Lakeside, ON", requested: "Cottage ensuite refresh", items: [["shower-base-48x36", "1"], ["pivot-door-36", "1"], ["soft-close-elongated", "1"]], install: false, fulfilment: "pickup", details: "Can pick up with a trailer on a weekend.", files: ["upl_demo_3"] },
    { userId: "usr_contractor_pending", customerType: "contractor", daysAgo: 1, status: "submitted", source: "form", project: "Bell Build & Reno — Oak Street job", requested: "Rigid core flooring for main floor", items: [["coastline-spc", "46 boxes", "Sandbar Beige"]], measurements: "~980 sq. ft.", install: false, fulfilment: "delivery" },
    { contact: { fullName: "Grace O'Neill", email: "grace.oneill@example.com", phone: "(555) 010-1654", preferredContact: "phone" }, customerType: "homeowner", daysAgo: 28, status: "declined", source: "form", project: "Your City, ON", requested: "French doors for home office", items: [["french-door-frosted", "1"]], install: true, fulfilment: "delivery", amount: 1649, notes: "Customer went with a different style." },
    { contact: { fullName: "Noah Fraser", email: "noah.fraser@example.com", phone: "(555) 010-1775", preferredContact: "email" }, customerType: "homeowner", daysAgo: 1, status: "submitted", source: "form", project: "Your City, ON", requested: "Stair refacing — 14 steps with landing", items: [["stair-refacing-package", "14 steps"]], install: true, fulfilment: "delivery", files: ["upl_demo_5"] },
  ];

  const sortedQuoteDefs = [...quoteDefs].sort((a, b) => b.daysAgo - a.daysAgo);
  const year = now.getFullYear();
  const quotes: Quote[] = sortedQuoteDefs.map((def, i) => {
    const user = def.userId ? userById.get(def.userId) : undefined;
    const created = at(def.daysAgo, 2 + i);
    const id = `qte_${quoteDefs.indexOf(def) + 1}`;
    const statusIdx = quoteStatusOrder.indexOf(def.status);
    const path: QuoteStatus[] =
      def.status === "declined"
        ? ["submitted", "under_review", "quoted", "declined"]
        : def.status === "info_required"
          ? ["submitted", "under_review", "info_required"]
          : (["submitted", "under_review", "quoted", "approved"] as QuoteStatus[]).filter(
              (s) => quoteStatusOrder.indexOf(s) <= statusIdx,
            );
    return {
      id,
      reference: formatQuoteReference(year, i + 1),
      createdAt: created,
      updatedAt: created,
      status: def.status,
      source: def.source,
      userId: def.userId,
      customerType: def.customerType,
      contact: user
        ? { fullName: user.fullName, email: user.email, phone: user.phone, companyName: user.companyName, preferredContact: user.preferredContact }
        : def.contact!,
      projectAddress: def.project,
      items: (def.items ?? []).map(([key, quantity, optionsLabel]) => {
        const p = byKey.get(key)!;
        return { productId: p.id, name: p.name, sku: p.sku, quantity, optionsLabel };
      }),
      productsRequested: def.requested,
      preferredStyles: def.styles,
      measurements: def.measurements,
      installationRequired: def.install,
      fulfilment: def.fulfilment,
      details: def.details,
      fileIds: def.files ?? [],
      quotedAmount: def.amount,
      adminNotes: def.notes,
      history: path.map((status, j) => ({
        status,
        at: new Date(new Date(created).getTime() + j * 86400000 * 0.8).toISOString(),
        by: j ? "Sam Morgan" : undefined,
      })),
    };
  });
  for (const q of quotes) q.updatedAt = q.history[q.history.length - 1].at;

  /* -------------------------- Contact messages ------------------------- */
  const contactSubmissions: ContactSubmission[] = [
    { id: "msg_1", createdAt: at(0, 2), name: "Liam Wright", email: "liam.wright@example.com", phone: "(555) 010-2001", topic: "Product question", message: "Is the Harbour Oak SPC suitable for a basement with in-floor heating? Planning about 600 sq. ft.", status: "new" },
    { id: "msg_2", createdAt: at(1, 5), name: "Emma Johnson", email: "emma.j@example.com", topic: "Delivery", message: "Do you deliver on Saturdays to the lakeside area? Looking to order a vanity and shower base.", status: "in_progress" },
    { id: "msg_3", createdAt: at(4, 1), name: "Ava Singh", email: "ava.singh@example.com", phone: "(555) 010-2003", topic: "Contractor account", message: "I submitted a contractor application last week — how long does approval usually take?", status: "resolved" },
    { id: "msg_4", createdAt: at(6, 3), name: "Ethan Brooks", email: "ethan.brooks@example.com", topic: "Returns", message: "I have 3 unopened boxes of Maple Mist left over from my project. Can they be returned?", status: "resolved" },
  ];

  /* ------------------------ Notification history ----------------------- */
  const emailLog: EmailLogEntry[] = [
    { id: "eml_1", createdAt: at(0, 1), template: "order_confirmation", to: "aisha.m@example.com", subject: `Order confirmed — ${orders.at(-1)?.number ?? ""}`, body: "Thanks for your order! We'll let you know when it's on its way.", status: "simulated" },
    { id: "eml_2", createdAt: at(1, 4), template: "contractor_application_admin", to: "admin@example.com", subject: "New contractor application — Bell Build & Reno", body: "Marcus Bell (Bell Build & Reno) applied for a contractor account.", status: "simulated", relatedId: "usr_contractor_pending" },
    { id: "eml_3", createdAt: at(1, 4), template: "contractor_application_received", to: "marcus.bell@example.com", subject: "We've received your contractor application", body: "Thanks for applying. Our team typically reviews applications within 1–2 business days.", status: "simulated" },
    { id: "eml_4", createdAt: at(3, 2), template: "quote_received", to: "jordan.avery@example.com", subject: `Quote request received — ${quotes.find((q) => q.id === "qte_6")?.reference}`, body: "We've received your quote request and will be in touch shortly.", status: "simulated", relatedId: "qte_6" },
    { id: "eml_5", createdAt: at(5, 6), template: "quote_status", to: "sofia.martins@example.com", subject: "More information needed for your quote", body: "Could you send photos of the knee wall and ceiling height?", status: "simulated", relatedId: "qte_4" },
  ];

  return { orders: orders.reverse(), quotes: quotes.reverse(), uploads, contactSubmissions, emailLog, lastOrderSeq: orderSeq, quoteCount: quotes.length };
}
