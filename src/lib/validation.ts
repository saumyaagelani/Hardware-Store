import { z } from "zod";

const phoneRegex = /^[+()\-.\s\d]{7,20}$/;
/** Canadian postal code, e.g. A1A 1A1 (space optional). */
export const postalCodeRegex = /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ -]?\d[ABCEGHJ-NPRSTV-Z]\d$/i;

export const requiredText = (label: string, max = 200) =>
  z.string().trim().min(1, `${label} is required`).max(max, `${label} is too long`);

export const emailField = z.string().trim().toLowerCase().email("Enter a valid email address").max(200);
export const phoneField = z.string().trim().regex(phoneRegex, "Enter a valid phone number");
export const postalCodeField = z
  .string()
  .trim()
  .regex(postalCodeRegex, "Enter a valid postal code (e.g. A1A 1A1)")
  .transform(normalizePostalCode);
export const contactMethodField = z.enum(["email", "phone", "text"]);
export const passwordField = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128)
  .regex(/[A-Za-z]/, "Include at least one letter")
  .regex(/\d/, "Include at least one number");

export const addressSchema = z.object({
  line1: requiredText("Street address"),
  line2: z.string().trim().max(200).optional().default(""),
  city: requiredText("City", 100),
  province: requiredText("Province", 50),
  postalCode: postalCodeField,
  country: z.string().trim().default("Canada"),
});

export function normalizePostalCode(value: string): string {
  const compact = value.replace(/[\s-]/g, "").toUpperCase();
  return compact.length === 6 ? `${compact.slice(0, 3)} ${compact.slice(3)}` : compact;
}

export const registerSchema = z
  .object({
    fullName: requiredText("Full name", 120),
    email: emailField,
    phone: phoneField,
    password: passwordField,
    confirmPassword: z.string(),
    companyName: z.string().trim().max(160).optional().default(""),
    hstNumber: z.string().trim().max(40).optional().default(""),
    preferredContact: contactMethodField,
    billing: addressSchema,
    sameDelivery: z.boolean(),
    delivery: addressSchema.optional(),
    marketingOptIn: z.boolean().optional().default(false),
  })
  .refine((d) => d.password === d.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] });

/** Business details — used when a signed-in customer upgrades to a contractor account. */
export const contractorBusinessSchema = z.object({
  contactName: requiredText("Contact name", 120),
  email: emailField,
  phone: phoneField,
  companyName: requiredText("Company / business name", 160),
  businessType: requiredText("Business type", 80),
  yearsInBusiness: z.string().trim().max(20).optional().default(""),
  hstNumber: z.string().trim().max(40).optional().default(""),
  tradeLicence: z.string().trim().max(60).optional().default(""),
  website: z.string().trim().max(200).optional().default(""),
  estimatedMonthlySpend: z.string().trim().max(40).optional().default(""),
  preferredContact: contactMethodField,
  businessAddress: addressSchema,
  notes: z.string().trim().max(2000).optional().default(""),
  agree: z.literal(true, { message: "Please accept the account terms" }),
});

/** Full application for new visitors (creates an account with a password). */
export const contractorApplicationSchema = contractorBusinessSchema
  .extend({ password: passwordField, confirmPassword: z.string() })
  .refine((d) => d.password === d.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] });

export const quoteSchema = z.object({
  fullName: requiredText("Full name", 120),
  email: emailField,
  phone: phoneField,
  companyName: z.string().trim().max(160).optional().default(""),
  projectAddress: requiredText("Project address", 300),
  customerType: z.enum(["homeowner", "contractor", "business", "designer"]),
  productsRequested: z.string().trim().max(3000).optional().default(""),
  preferredStyles: z.string().trim().max(1000).optional().default(""),
  quantities: z.string().trim().max(1000).optional().default(""),
  measurements: z.string().trim().max(1000).optional().default(""),
  installationRequired: z.enum(["yes", "no"]),
  fulfilment: z.enum(["delivery", "pickup"]),
  preferredDate: z.string().trim().max(20).optional().default(""),
  details: z.string().trim().max(4000).optional().default(""),
  preferredContact: contactMethodField,
  fileIds: z.array(z.string().max(64)).max(8).default([]),
  source: z.enum(["form", "cart", "product"]).default("form"),
  items: z
    .array(
      z.object({
        productId: z.string().max(64).optional(),
        name: z.string().max(200),
        sku: z.string().max(60).optional(),
        quantity: z.string().max(40),
        optionsLabel: z.string().max(200).optional(),
      }),
    )
    .max(50)
    .default([]),
});

export const contactSchema = z.object({
  name: requiredText("Name", 120),
  email: emailField,
  phone: z.union([phoneField, z.literal("")]).optional().default(""),
  topic: requiredText("Topic", 80),
  message: z.string().trim().min(10, "Please include a few more details").max(4000),
});

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Password is required").max(128),
});

/** Flatten zod issues into a { field: message } map for form display. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
