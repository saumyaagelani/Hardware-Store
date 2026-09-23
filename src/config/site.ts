import type { DepartmentId } from "@/lib/types";

/** Departments group categories in the navigation and mega-menu. */
export const departments: { id: DepartmentId; name: string; blurb: string }[] = [
  { id: "flooring", name: "Flooring & Stairs", blurb: "Vinyl plank, tile and stair systems" },
  { id: "doors", name: "Doors & Hardware", blurb: "Interior doors, locks and handlesets" },
  { id: "bath", name: "Bathroom", blurb: "Vanities, shower systems and fixtures" },
  { id: "plumbing", name: "Plumbing", blurb: "Valves, supply lines and drains" },
  { id: "walls", name: "Walls", blurb: "WPC wall panels and trims" },
];

/** Primary storefront navigation (desktop bar + mobile drawer). */
export const primaryNav: { label: string; href: string; department?: DepartmentId }[] = [
  { label: "Vinyl Flooring", href: "/shop/vinyl" },
  { label: "Doors & Locks", href: "/shop/doors", department: "doors" },
  { label: "Stairs", href: "/shop/stairs" },
  { label: "Bathroom", href: "/shop/vanities", department: "bath" },
  { label: "Plumbing", href: "/shop/plumbing" },
  { label: "WPC Wall Panels", href: "/shop/wpc-wall-panels" },
];

export const footerNav = {
  shop: [
    { label: "All Products", href: "/shop" },
    { label: "Deals & Sale", href: "/deals" },
    { label: "Vinyl Flooring", href: "/shop/vinyl" },
    { label: "Doors", href: "/shop/doors" },
    { label: "Vanities", href: "/shop/vanities" },
    { label: "WPC Wall Panels", href: "/shop/wpc-wall-panels" },
  ],
  service: [
    { label: "Free Quote", href: "/quote" },
    { label: "Delivery & Pickup", href: "/policies/delivery" },
    { label: "Returns", href: "/policies/returns" },
    { label: "Contact Us", href: "/contact" },
    { label: "My Account", href: "/account" },
  ],
  business: [
    { label: "Contractor Program", href: "/contractors" },
    { label: "Apply for an Account", href: "/contractors/apply" },
    { label: "Project Quotes", href: "/quote?type=contractor" },
  ],
  legal: [
    { label: "Privacy", href: "/policies/privacy" },
    { label: "Terms", href: "/policies/terms" },
  ],
};
