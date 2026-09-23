import type { Banner, EmailTemplate, SiteContent, StoreSettings } from "@/lib/types";
import { business } from "@/config/business";

const allTemplates: EmailTemplate[] = [
  "account_registered",
  "contractor_application_received",
  "contractor_application_admin",
  "contractor_approved",
  "contractor_rejected",
  "quote_received",
  "quote_admin",
  "quote_status",
  "order_confirmation",
  "order_admin",
  "order_status",
  "contact_admin",
  "newsletter_signup",
];

/**
 * Delivery zones use postal-code prefixes (Forward Sortation Area letters).
 * These are PLACEHOLDER zones for the prototype — replace with the client's
 * real service area once confirmed.
 */
export function buildSettings(): StoreSettings {
  return {
    taxRate: 0.13,
    taxLabel: "HST (13%)",
    deliveryZones: [
      { id: "zone_local", name: "Local Delivery", postalPrefixes: ["L4", "L5", "L6", "L7"], fee: 79, freeOver: 2500, leadTime: "1–3 business days", active: true },
      { id: "zone_metro", name: "Metro Area", postalPrefixes: ["M"], fee: 119, freeOver: 4000, leadTime: "2–4 business days", active: true },
      { id: "zone_extended", name: "Extended Area", postalPrefixes: ["L1", "L3", "L9", "N"], fee: 169, leadTime: "3–5 business days", active: true },
    ],
    pickupLocations: [
      {
        id: "pickup_main",
        name: "Main Showroom & Warehouse",
        address: { ...business.address },
        hours: "Mon–Fri 7:30–6:00 · Sat 8:00–4:00",
        instructions: "Park at the loading doors at the rear of the building and bring your order number. Staff will help load larger items.",
        readyTime: "Within 2 business hours",
        active: true,
      },
      {
        id: "pickup_yard",
        name: "Contractor Yard — Door 3",
        address: { ...business.address, line1: "100 Placeholder Avenue, Door 3" },
        hours: "Mon–Fri 6:30–3:00",
        instructions: "Trade pickup for bulk and oversized orders. Trailer access available.",
        readyTime: "Next business day",
        active: true,
      },
    ],
    oversizedUnitThreshold: 6,
    deliveryNotes:
      "Delivery is curbside or to the garage. Oversized or unusually large orders are reviewed by our team and the delivery fee will be confirmed before dispatch.",
    emailNotifications: Object.fromEntries(allTemplates.map((t) => [t, true])) as Record<EmailTemplate, boolean>,
    adminNotificationEmail: "admin@example.com",
  };
}

export function buildBanners(): Banner[] {
  return [
    { id: "ban_1", placement: "announcement", title: "Contractor pricing now available — apply for a trade account in minutes", ctaLabel: "Apply", ctaHref: "/contractors", theme: "dark", active: true, sortOrder: 1 },
    { id: "ban_2", placement: "announcement", title: "Fall Flooring Event: save up to 20% on select vinyl plank", ctaLabel: "Shop deals", ctaHref: "/deals", theme: "dark", active: true, sortOrder: 2 },
    { id: "ban_3", placement: "promo", eyebrow: "Fall Flooring Event", title: "Save up to 20% on waterproof vinyl", body: "Harbour Oak, Urban Concrete and more — while stock lasts.", ctaLabel: "Shop vinyl deals", ctaHref: "/deals?category=vinyl", theme: "dark", active: true, sortOrder: 1 },
    { id: "ban_4", placement: "promo", eyebrow: "Bathroom Refresh", title: "Vanities, shower doors & bases", body: "Coordinated matte black and chrome collections.", ctaLabel: "Shop bathroom", ctaHref: "/shop/vanities", theme: "gold", active: true, sortOrder: 2 },
    { id: "ban_5", placement: "promo", eyebrow: "New Arrivals", title: "Fluted WPC feature walls", body: "Four finishes. Installs in an afternoon.", ctaLabel: "Explore panels", ctaHref: "/shop/wpc-wall-panels", theme: "light", active: true, sortOrder: 3 },
  ];
}

export function buildContent(): SiteContent {
  return {
    heroEyebrow: "Flooring · Doors · Bath · Plumbing",
    heroTitle: "Building materials for every project, big or small.",
    heroBody:
      "Shop waterproof vinyl, doors and hardware, vanities and shower systems — with in-store pickup, local delivery and dedicated pricing for contractors.",
    aboutTitle: "Your local building supply partner",
    aboutBody:
      "Placeholder About Us copy — to be supplied by the client. Describe the company history, the team, the showroom and what makes the service different for homeowners and trade professionals.",
    contractorPitch:
      "Approved trade accounts see contractor pricing on every eligible product automatically, plus project quotes, job-site delivery and a dedicated account contact.",
    quotePitch:
      "Tell us about your project — measurements, photos or floor plans — and our team will prepare a detailed quote, usually within one business day.",
  };
}
