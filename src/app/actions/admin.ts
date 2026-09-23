"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/action-result";
import type { ArtKind, Banner, OrderStatus, Product, QuoteStatus, StaffPermission, User } from "@/lib/types";
import { fieldErrors, emailField, requiredText, addressSchema } from "@/lib/validation";
import { slugify } from "@/lib/format";
import { getDb, mutate, newId } from "@/server/db";
import { requireStaff } from "@/server/auth/session";
import { hashPassword } from "@/server/auth/password";
import { notifyContractorDecision, notifyOrderStatus, notifyQuoteStatus } from "@/server/services/notifications";

/**
 * ADMIN ACTIONS — every action re-checks the signed-in user's role and
 * permission on the server. Client-side hiding of admin UI is never relied on.
 */

const money = z.union([z.number().min(0).max(1_000_000), z.null()]);
const refresh = () => revalidatePath("/", "layout");

/* --------------------------------- Products -------------------------------- */

const productSchema = z.object({
  name: requiredText("Name", 200),
  slug: z.string().trim().max(120).optional().default(""),
  sku: requiredText("SKU", 60),
  brand: requiredText("Brand", 80),
  categoryId: requiredText("Category", 60),
  subcategory: z.string().trim().max(60).optional().default(""),
  shortDescription: requiredText("Short description", 300),
  description: z.string().trim().max(5000).default(""),
  features: z.array(z.string().trim().max(200)).max(20).default([]),
  pricing: z.object({
    retail: money,
    sale: money,
    contractor: money,
    visibility: z.enum(["public", "contractors_only", "hidden"]),
    unit: z.enum(["each", "box", "sqft", "set", "piece", "pack"]),
    saleEndsAt: z.string().max(30).optional().default(""),
  }),
  inventory: z.object({
    status: z.enum(["in_stock", "low_stock", "out_of_stock", "special_order"]),
    quantity: z.number().int().min(0).max(1_000_000),
    lowStockThreshold: z.number().int().min(0).max(100_000),
    restockDate: z.string().max(30).optional().default(""),
    leadTime: z.string().trim().max(60).optional().default(""),
  }),
  coveragePerUnit: z.union([z.number().min(0).max(1000), z.null()]).default(null),
  coverageUnitLabel: z.string().trim().max(20).optional().default("box"),
  attributes: z.object({
    colour: z.string().trim().max(80).optional().default(""),
    finish: z.string().trim().max(80).optional().default(""),
    dimensions: z.string().trim().max(80).optional().default(""),
    thickness: z.string().trim().max(80).optional().default(""),
    material: z.string().trim().max(80).optional().default(""),
  }),
  specifications: z.array(z.object({ label: z.string().trim().max(80), value: z.string().trim().max(200) })).max(40).default([]),
  installation: z.string().trim().max(3000).optional().default(""),
  warranty: z.string().trim().max(2000).optional().default(""),
  images: z.array(z.object({ src: z.string().trim().max(500), alt: z.string().trim().max(200) })).max(12).default([]),
  documents: z
    .array(z.object({ id: z.string().max(40), name: z.string().trim().max(120), kind: z.enum(["spec_sheet", "install_guide", "warranty", "care_guide"]), url: z.string().trim().max(500), sizeKb: z.number().min(0).max(100000) }))
    .max(12)
    .default([]),
  variants: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(40),
        options: z.array(z.object({ value: z.string().trim().min(1).max(60), label: z.string().trim().min(1).max(60), swatch: z.string().max(7).optional(), skuSuffix: z.string().max(10).optional(), priceAdjustment: z.number().min(-100000).max(100000).optional() })).max(20),
      }),
    )
    .max(5)
    .default([]),
  relatedIds: z.array(z.string().max(80)).max(20).default([]),
  accessoryIds: z.array(z.string().max(80)).max(20).default([]),
  minOrderQty: z.union([z.number().int().min(1).max(1000), z.null()]).default(null),
  oversized: z.boolean().default(false),
  badges: z.array(z.enum(["new", "best_seller", "clearance", "eco", "exclusive"])).max(5).default([]),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
});

export type ProductInput = z.input<typeof productSchema>;

const artKindByCategory: Record<string, ArtKind> = {
  vinyl: "vinyl",
  stairs: "stairs",
  doors: "door",
  locks: "lock",
  "shower-bases": "shower-base",
  "shower-doors": "shower-door",
  "shower-accessories": "shower-accessory",
  "toilet-seats": "toilet-seat",
  vanities: "vanity",
  plumbing: "plumbing",
  "wpc-wall-panels": "wpc-panel",
};

function isSafeUrl(url: string) {
  return url.startsWith("/") || /^https:\/\//.test(url);
}

export async function saveProductAction(id: string | null, input: ProductInput): Promise<ActionResult<{ id: string; slug: string }>> {
  await requireStaff("catalog");
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please fix the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };
  const d = parsed.data;
  const errors: Record<string, string> = {};
  if (d.pricing.sale !== null && d.pricing.retail !== null && d.pricing.sale >= d.pricing.retail) errors["pricing.sale"] = "Sale price must be lower than the retail price";
  if (d.pricing.contractor !== null && d.pricing.retail !== null && d.pricing.contractor > d.pricing.retail) errors["pricing.contractor"] = "Contractor price shouldn't exceed the retail price";
  if (d.images.some((i) => !isSafeUrl(i.src))) errors.images = "Image URLs must be site paths or https:// links";
  if (d.documents.some((doc) => !isSafeUrl(doc.url))) errors.documents = "Document URLs must be site paths or https:// links";
  const db = getDb();
  if (!db.categories.some((c) => c.id === d.categoryId)) errors.categoryId = "Choose a category";
  const slug = slugify(d.slug || d.name);
  if (db.products.some((p) => p.slug === slug && p.id !== id)) errors.slug = "Another product already uses this URL";
  if (db.products.some((p) => p.sku.toLowerCase() === d.sku.toLowerCase() && p.id !== id)) errors.sku = "SKU already in use";
  if (Object.keys(errors).length) return { ok: false, error: "Please fix the highlighted fields.", fieldErrors: errors };

  const now = new Date().toISOString();
  const saved = mutate((m) => {
    const existing = id ? m.products.find((p) => p.id === id) : undefined;
    const base: Product = existing ?? {
      id: newId("prd"),
      slug,
      createdAt: now,
      updatedAt: now,
      art: { kind: artKindByCategory[d.categoryId] ?? "vinyl", primary: "#b9bcbf", variant: 0 },
    } as Product;
    const next: Product = {
      ...base,
      name: d.name,
      slug,
      sku: d.sku,
      brand: d.brand,
      categoryId: d.categoryId,
      subcategory: d.subcategory || undefined,
      shortDescription: d.shortDescription,
      description: d.description,
      features: d.features.filter(Boolean),
      pricing: {
        retail: d.pricing.retail,
        sale: d.pricing.sale,
        contractor: d.pricing.contractor,
        visibility: d.pricing.visibility,
        unit: d.pricing.unit,
        saleEndsAt: d.pricing.saleEndsAt ? new Date(d.pricing.saleEndsAt).toISOString() : undefined,
      },
      inventory: {
        ...base.inventory,
        status: d.inventory.status,
        quantity: d.inventory.quantity,
        lowStockThreshold: d.inventory.lowStockThreshold,
        restockDate: d.inventory.restockDate ? new Date(d.inventory.restockDate).toISOString() : undefined,
        leadTime: d.inventory.leadTime || undefined,
      },
      coverage: d.coveragePerUnit ? { type: "area", perUnit: d.coveragePerUnit, unitLabel: d.coverageUnitLabel || "box" } : undefined,
      attributes: Object.fromEntries(Object.entries(d.attributes).filter(([, v]) => v)) as Product["attributes"],
      specifications: d.specifications.filter((s) => s.label && s.value),
      installation: d.installation || undefined,
      warranty: d.warranty || undefined,
      images: d.images.filter((i) => i.src),
      documents: d.documents.filter((doc) => doc.url && doc.name),
      variants: d.variants.filter((g) => g.options.length),
      relatedIds: d.relatedIds.filter((x) => x !== base.id),
      accessoryIds: d.accessoryIds.filter((x) => x !== base.id),
      minOrderQty: d.minOrderQty ?? undefined,
      oversized: d.oversized,
      badges: d.badges,
      featured: d.featured,
      active: d.active,
      updatedAt: now,
    };
    // New products without photos get placeholder illustrations until real images are added.
    if (!next.images.length && next.art) {
      next.images = [1, 2].map((n) => ({ src: `/media/products/${slug}/${n}.svg`, alt: `${d.name} — illustration ${n}` }));
    }
    if (existing) Object.assign(existing, next);
    else m.products.push(next);
    return next;
  });
  refresh();
  return { ok: true, id: saved.id, slug: saved.slug };
}

export async function quickUpdateInventoryAction(id: string, input: { status: Product["inventory"]["status"]; quantity: number; restockDate?: string }): Promise<ActionResult> {
  await requireStaff("catalog");
  const parsed = z
    .object({ status: z.enum(["in_stock", "low_stock", "out_of_stock", "special_order"]), quantity: z.number().int().min(0).max(1_000_000), restockDate: z.string().max(30).optional() })
    .safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid stock values" };
  mutate((db) => {
    const p = db.products.find((x) => x.id === id);
    if (!p) return;
    p.inventory.quantity = parsed.data.quantity;
    p.inventory.status = parsed.data.status;
    p.inventory.restockDate = parsed.data.restockDate ? new Date(parsed.data.restockDate).toISOString() : p.inventory.status === "out_of_stock" ? p.inventory.restockDate : undefined;
    p.updatedAt = new Date().toISOString();
  });
  refresh();
  return { ok: true };
}

export async function quickUpdatePricingAction(
  id: string,
  input: { retail: number | null; sale: number | null; contractor: number | null; visibility: Product["pricing"]["visibility"] },
): Promise<ActionResult> {
  await requireStaff("catalog");
  const parsed = z.object({ retail: money, sale: money, contractor: money, visibility: z.enum(["public", "contractors_only", "hidden"]) }).safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid price values" };
  const d = parsed.data;
  if (d.sale !== null && d.retail !== null && d.sale >= d.retail) return { ok: false, error: "Sale price must be lower than retail" };
  mutate((db) => {
    const p = db.products.find((x) => x.id === id);
    if (!p) return;
    Object.assign(p.pricing, { retail: d.retail, sale: d.sale, contractor: d.contractor, visibility: d.visibility });
    p.updatedAt = new Date().toISOString();
  });
  refresh();
  return { ok: true };
}

export async function toggleProductFlagAction(id: string, flag: "featured" | "active"): Promise<ActionResult> {
  await requireStaff("catalog");
  mutate((db) => {
    const p = db.products.find((x) => x.id === id);
    if (p) p[flag] = !p[flag];
  });
  refresh();
  return { ok: true };
}

/* -------------------------------- Categories ------------------------------- */

export async function saveCategoryAction(id: string, input: { name: string; description: string; subcategories: { slug: string; name: string }[] }): Promise<ActionResult> {
  await requireStaff("catalog");
  const parsed = z
    .object({ name: requiredText("Name", 80), description: z.string().trim().max(600), subcategories: z.array(z.object({ slug: z.string().max(60), name: z.string().trim().min(1).max(60) })).max(20) })
    .safeParse(input);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error) };
  mutate((db) => {
    const c = db.categories.find((x) => x.id === id);
    if (!c) return;
    c.name = parsed.data.name;
    c.description = parsed.data.description;
    c.subcategories = parsed.data.subcategories.map((s) => ({ name: s.name, slug: s.slug || slugify(s.name) }));
  });
  refresh();
  return { ok: true };
}

/* --------------------------- Contractor decisions -------------------------- */

export async function decideContractorAction(userId: string, decision: "approved" | "rejected" | "pending", note?: string): Promise<ActionResult> {
  const staff = await requireStaff("customers");
  const cleanNote = note?.trim().slice(0, 500) || undefined;
  const user = mutate((db) => {
    const u = db.users.find((x) => x.id === userId && x.accountType === "contractor");
    if (!u) return null;
    u.contractorStatus = decision;
    u.pricingTier = decision === "approved" ? "contractor" : undefined;
    if (u.contractorApplication) {
      u.contractorApplication.reviewedAt = decision === "pending" ? undefined : new Date().toISOString();
      u.contractorApplication.reviewedBy = decision === "pending" ? undefined : staff.fullName;
      u.contractorApplication.decisionNote = cleanNote;
    }
    return { ...u };
  });
  if (!user) return { ok: false, error: "Application not found" };
  if (decision !== "pending") await notifyContractorDecision(user, decision === "approved", cleanNote);
  refresh();
  return { ok: true };
}

export async function updateCustomerNotesAction(userId: string, notes: string): Promise<ActionResult> {
  await requireStaff("customers");
  mutate((db) => {
    const u = db.users.find((x) => x.id === userId);
    if (u) u.notes = notes.slice(0, 2000) || undefined;
  });
  refresh();
  return { ok: true };
}

/* ---------------------------------- Orders --------------------------------- */

export async function updateOrderStatusAction(orderId: string, status: OrderStatus, note?: string, notify = true): Promise<ActionResult> {
  const staff = await requireStaff("orders");
  const valid = ["awaiting_payment", "processing", "ready_for_pickup", "out_for_delivery", "completed", "cancelled"];
  if (!valid.includes(status)) return { ok: false, error: "Invalid status" };
  const order = mutate((db) => {
    const o = db.orders.find((x) => x.id === orderId);
    if (!o) return null;
    o.status = status;
    if (status !== "awaiting_payment" && status !== "cancelled" && o.payment.status === "awaiting_payment") o.payment.status = "paid";
    if (status === "cancelled" && o.payment.status === "paid") o.payment.status = "refunded";
    o.history.push({ status, at: new Date().toISOString(), note: note?.trim().slice(0, 500) || undefined, by: staff.fullName });
    return { ...o };
  });
  if (!order) return { ok: false, error: "Order not found" };
  if (notify) await notifyOrderStatus(order);
  refresh();
  return { ok: true };
}

export async function confirmDeliveryFeeAction(orderId: string, fee: number): Promise<ActionResult> {
  await requireStaff("orders");
  if (!Number.isFinite(fee) || fee < 0 || fee > 10000) return { ok: false, error: "Enter a valid fee" };
  mutate((db) => {
    const o = db.orders.find((x) => x.id === orderId);
    if (!o || o.fulfilment.method !== "delivery") return;
    o.fulfilment.feeToBeConfirmed = false;
    o.deliveryFee = Math.round(fee * 100) / 100;
    o.tax = Math.round((o.subtotal + o.deliveryFee) * o.taxRate * 100) / 100;
    o.total = Math.round((o.subtotal + o.deliveryFee + o.tax) * 100) / 100;
  });
  refresh();
  return { ok: true };
}

/* ---------------------------------- Quotes --------------------------------- */

export async function updateQuoteAction(
  quoteId: string,
  input: { status: QuoteStatus; note?: string; quotedAmount?: number | null; adminNotes?: string; notify?: boolean },
): Promise<ActionResult> {
  const staff = await requireStaff("quotes");
  const parsed = z
    .object({
      status: z.enum(["submitted", "under_review", "info_required", "quoted", "approved", "declined"]),
      note: z.string().trim().max(1000).optional(),
      quotedAmount: z.union([z.number().min(0).max(10_000_000), z.null()]).optional(),
      adminNotes: z.string().trim().max(3000).optional(),
      notify: z.boolean().optional(),
    })
    .safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid quote update" };
  const d = parsed.data;
  if (d.status === "quoted" && !d.quotedAmount) return { ok: false, fieldErrors: { quotedAmount: "Enter the quoted amount" } };
  const quote = mutate((db) => {
    const q = db.quotes.find((x) => x.id === quoteId);
    if (!q) return null;
    const statusChanged = q.status !== d.status;
    q.status = d.status;
    q.quotedAmount = d.quotedAmount ?? undefined;
    q.adminNotes = d.adminNotes || undefined;
    q.updatedAt = new Date().toISOString();
    if (statusChanged || d.note) q.history.push({ status: d.status, at: q.updatedAt, note: d.note || undefined, by: staff.fullName });
    return { quote: { ...q }, statusChanged };
  });
  if (!quote) return { ok: false, error: "Quote not found" };
  if (quote.statusChanged && d.notify !== false) await notifyQuoteStatus(quote.quote, d.note);
  refresh();
  return { ok: true };
}

/* ------------------------------ Delivery / pickup ------------------------------ */

const zoneSchema = z.object({
  id: z.string().max(40),
  name: requiredText("Zone name", 60),
  postalPrefixes: z.array(z.string().trim().toUpperCase().regex(/^[A-Z](\d[A-Z]?)?$/, "Use prefixes like M, L5 or L5A")).min(1).max(40),
  fee: z.number().min(0).max(5000),
  freeOver: z.union([z.number().min(0).max(1_000_000), z.null()]),
  leadTime: z.string().trim().max(60),
  active: z.boolean(),
});

export async function saveDeliverySettingsAction(input: { zones: unknown[]; oversizedUnitThreshold: number; deliveryNotes: string; taxRate: number; taxLabel: string }): Promise<ActionResult> {
  await requireStaff("settings");
  const parsed = z
    .object({
      zones: z.array(zoneSchema).max(20),
      oversizedUnitThreshold: z.number().int().min(0).max(1000),
      deliveryNotes: z.string().trim().max(1000),
      taxRate: z.number().min(0).max(0.3),
      taxLabel: requiredText("Tax label", 40),
    })
    .safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please check the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };
  mutate((db) => {
    db.settings.deliveryZones = parsed.data.zones.map((z) => ({ ...z, id: z.id || newId("zone"), freeOver: z.freeOver ?? undefined }));
    db.settings.oversizedUnitThreshold = parsed.data.oversizedUnitThreshold;
    db.settings.deliveryNotes = parsed.data.deliveryNotes;
    db.settings.taxRate = parsed.data.taxRate;
    db.settings.taxLabel = parsed.data.taxLabel;
  });
  refresh();
  return { ok: true };
}

export async function savePickupLocationsAction(locations: unknown[]): Promise<ActionResult> {
  await requireStaff("settings");
  const parsed = z
    .array(
      z.object({
        id: z.string().max(40),
        name: requiredText("Location name", 80),
        address: addressSchema,
        hours: requiredText("Hours", 120),
        instructions: z.string().trim().max(600),
        readyTime: requiredText("Ready time", 60),
        active: z.boolean(),
      }),
    )
    .min(1, "Keep at least one pickup location")
    .max(10)
    .safeParse(locations);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid locations", fieldErrors: fieldErrors(parsed.error) };
  mutate((db) => {
    db.settings.pickupLocations = parsed.data.map((l) => ({ ...l, id: l.id || newId("pickup") }));
  });
  refresh();
  return { ok: true };
}

/* ------------------------------ Content & promos ------------------------------ */

export async function saveBannerAction(input: Omit<Banner, "id"> & { id?: string }): Promise<ActionResult> {
  await requireStaff("content");
  const parsed = z
    .object({
      id: z.string().max(40).optional(),
      placement: z.enum(["announcement", "hero", "promo"]),
      eyebrow: z.string().trim().max(60).optional(),
      title: requiredText("Title", 140),
      body: z.string().trim().max(300).optional(),
      ctaLabel: z.string().trim().max(40).optional(),
      ctaHref: z.string().trim().max(200).refine((v) => !v || v.startsWith("/"), "Links must be site paths starting with /").optional(),
      theme: z.enum(["dark", "gold", "light"]),
      active: z.boolean(),
      sortOrder: z.number().int().min(0).max(100),
    })
    .safeParse(input);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error) };
  mutate((db) => {
    const d = parsed.data;
    const existing = d.id ? db.banners.find((b) => b.id === d.id) : undefined;
    if (existing) Object.assign(existing, d);
    else db.banners.push({ ...d, id: newId("ban") });
  });
  refresh();
  return { ok: true };
}

export async function deleteBannerAction(id: string): Promise<ActionResult> {
  await requireStaff("content");
  mutate((db) => {
    db.banners = db.banners.filter((b) => b.id !== id);
  });
  refresh();
  return { ok: true };
}

export async function saveContentAction(input: unknown): Promise<ActionResult> {
  await requireStaff("content");
  const parsed = z
    .object({
      heroEyebrow: z.string().trim().max(80),
      heroTitle: requiredText("Hero title", 120),
      heroBody: z.string().trim().max(400),
      aboutTitle: z.string().trim().max(120),
      aboutBody: z.string().trim().max(3000),
      contractorPitch: z.string().trim().max(500),
      quotePitch: z.string().trim().max(500),
    })
    .safeParse(input);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error) };
  mutate((db) => {
    db.content = parsed.data;
  });
  refresh();
  return { ok: true };
}

export async function updateContactStatusAction(id: string, status: "new" | "in_progress" | "resolved"): Promise<ActionResult> {
  await requireStaff("customers");
  mutate((db) => {
    const m = db.contactSubmissions.find((x) => x.id === id);
    if (m) m.status = status;
  });
  refresh();
  return { ok: true };
}

/* ------------------------------- Notifications ------------------------------- */

export async function saveEmailSettingsAction(input: { templates: Record<string, boolean>; adminNotificationEmail: string }): Promise<ActionResult> {
  await requireStaff("settings");
  const email = emailField.safeParse(input.adminNotificationEmail);
  if (!email.success) return { ok: false, fieldErrors: { adminNotificationEmail: "Enter a valid email" } };
  mutate((db) => {
    for (const key of Object.keys(db.settings.emailNotifications) as (keyof typeof db.settings.emailNotifications)[]) {
      if (typeof input.templates[key] === "boolean") db.settings.emailNotifications[key] = input.templates[key];
    }
    db.settings.adminNotificationEmail = email.data;
  });
  refresh();
  return { ok: true };
}

/* ---------------------------------- Staff ---------------------------------- */

const permissionEnum = z.enum(["catalog", "orders", "quotes", "customers", "content", "settings"]);

export async function saveStaffAction(input: { id?: string; fullName: string; email: string; role: "admin" | "staff"; permissions: StaffPermission[]; password?: string }): Promise<ActionResult> {
  const me = await requireStaff();
  if (me.role !== "admin") return { ok: false, error: "Only administrators can manage staff accounts." };
  const parsed = z
    .object({
      id: z.string().max(40).optional(),
      fullName: requiredText("Name", 120),
      email: emailField,
      role: z.enum(["admin", "staff"]),
      permissions: z.array(permissionEnum).max(6),
      password: z.string().max(128).optional(),
    })
    .safeParse(input);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error) };
  const d = parsed.data;
  const db = getDb();
  if (db.users.some((u) => u.email === d.email && u.id !== d.id)) return { ok: false, fieldErrors: { email: "Email already in use" } };
  if (!d.id && (!d.password || d.password.length < 8)) return { ok: false, fieldErrors: { password: "Set a temporary password (8+ characters)" } };
  if (d.id === me.id && d.role !== "admin") return { ok: false, error: "You can't remove your own administrator role." };
  mutate((m) => {
    const existing = d.id ? m.users.find((u) => u.id === d.id) : undefined;
    const permissions = d.role === "admin" ? (["catalog", "orders", "quotes", "customers", "content", "settings"] as StaffPermission[]) : d.permissions;
    if (existing) {
      existing.fullName = d.fullName;
      existing.email = d.email;
      existing.role = d.role;
      existing.staffPermissions = permissions;
      if (d.password) existing.passwordHash = hashPassword(d.password);
    } else {
      const user: User = {
        id: newId("usr"),
        email: d.email,
        passwordHash: hashPassword(d.password!),
        fullName: d.fullName,
        phone: "",
        role: d.role,
        accountType: "regular",
        preferredContact: "email",
        deliveryAddresses: [],
        staffPermissions: permissions,
        createdAt: new Date().toISOString(),
      };
      m.users.push(user);
    }
  });
  refresh();
  return { ok: true };
}

export async function removeStaffAction(id: string): Promise<ActionResult> {
  const me = await requireStaff();
  if (me.role !== "admin") return { ok: false, error: "Only administrators can manage staff accounts." };
  if (id === me.id) return { ok: false, error: "You can't remove your own account." };
  mutate((db) => {
    const u = db.users.find((x) => x.id === id);
    if (u && u.role !== "customer") {
      u.role = "customer";
      u.staffPermissions = undefined;
    }
  });
  refresh();
  return { ok: true };
}
