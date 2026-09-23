/**
 * BUSINESS INFORMATION — PLACEHOLDERS
 * -----------------------------------------------------------------------------
 * Final business details have not been supplied yet. Every value below is a
 * clearly-fictional placeholder (555 phone numbers, example.com addresses,
 * "Placeholder" street names). Replace them here and they update site-wide.
 */
export const business = {
  /** Set to false once real details have been entered. Shows a subtle notice in the footer. */
  isPlaceholder: true,
  name: "Northline Building Supply",
  shortName: "Northline",
  tagline: "Flooring, doors & bath — supplied right.",
  legalName: "Northline Building Supply (placeholder legal name)",
  phone: "(555) 010-0142",
  phoneHref: "tel:+15550100142",
  textNumber: "(555) 010-0143",
  email: "sales@example.com",
  quoteEmail: "quotes@example.com",
  address: {
    line1: "100 Placeholder Avenue, Unit 4",
    city: "Your City",
    province: "ON",
    postalCode: "A1A 1A1",
    country: "Canada",
  },
  hours: [
    { days: "Monday – Friday", time: "7:30 am – 6:00 pm" },
    { days: "Saturday", time: "8:00 am – 4:00 pm" },
    { days: "Sunday", time: "Closed" },
  ],
  /** Hours shown are placeholders pending client confirmation. */
  social: {
    facebook: "#",
    instagram: "#",
  },
  /** Google Maps embed/link — add once the address is final. */
  mapUrl: "",
  currency: "CAD",
  locale: "en-CA",
} as const;

export const formattedAddress = `${business.address.line1}, ${business.address.city}, ${business.address.province} ${business.address.postalCode}`;
