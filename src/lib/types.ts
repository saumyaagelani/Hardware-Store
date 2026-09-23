/**
 * Domain model for the store. These types are shared by the data layer,
 * server actions and UI. Anything that is sent to the browser should use the
 * *View* types (see lib/catalog-view.ts) so that restricted fields such as the
 * contractor price never leave the server for unauthorised viewers.
 */

export type ISODate = string;

/* ----------------------------------------------------------------------------
 * Accounts
 * ------------------------------------------------------------------------- */

export type AccountType = "regular" | "contractor";
export type ContractorStatus = "pending" | "approved" | "rejected";
export type ContactMethod = "email" | "phone" | "text";
export type UserRole = "customer" | "admin" | "staff";
export type StaffPermission = "catalog" | "orders" | "quotes" | "customers" | "content" | "settings";

export interface Address {
  label?: string;
  name?: string;
  company?: string;
  line1: string;
  line2?: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

export interface ContractorApplication {
  submittedAt: ISODate;
  businessType: string;
  yearsInBusiness?: string;
  tradeLicence?: string;
  website?: string;
  estimatedMonthlySpend?: string;
  notes?: string;
  reviewedAt?: ISODate;
  reviewedBy?: string;
  decisionNote?: string;
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  phone: string;
  role: UserRole;
  accountType: AccountType;
  /** Only meaningful when accountType === "contractor". */
  contractorStatus?: ContractorStatus;
  /** Reserved for future multi-tier / customer-specific pricing. */
  pricingTier?: string;
  companyName?: string;
  hstNumber?: string;
  businessAddress?: Address;
  billingAddress?: Address;
  deliveryAddresses: Address[];
  preferredContact: ContactMethod;
  marketingOptIn?: boolean;
  contractorApplication?: ContractorApplication;
  staffPermissions?: StaffPermission[];
  createdAt: ISODate;
  lastLoginAt?: ISODate;
  notes?: string;
}

/* ----------------------------------------------------------------------------
 * Catalogue
 * ------------------------------------------------------------------------- */

export interface Subcategory {
  slug: string;
  name: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  shortName?: string;
  department: DepartmentId;
  description: string;
  subcategories: Subcategory[];
  sortOrder: number;
}

export type DepartmentId = "flooring" | "doors" | "bath" | "plumbing" | "walls";

/** hidden = nobody sees a price; contractors_only = only approved contractors see prices. */
export type PriceVisibility = "public" | "contractors_only" | "hidden";

export type SellingUnit = "each" | "box" | "sqft" | "set" | "piece" | "pack";

export interface ProductPricing {
  retail: number | null;
  sale: number | null;
  contractor: number | null;
  visibility: PriceVisibility;
  unit: SellingUnit;
  saleEndsAt?: ISODate;
}

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock" | "special_order";

export interface ProductInventory {
  status: StockStatus;
  quantity: number;
  lowStockThreshold: number;
  restockDate?: ISODate;
  leadTime?: string;
  /** External POS / inventory system identifier — reserved for integrations. */
  externalId?: string;
}

/** How a product maps to coverage, used by the measurement calculator. */
export interface CoverageInfo {
  type: "area";
  /** Square feet covered by one selling unit (e.g. per box). */
  perUnit: number;
  unitLabel: string;
}

export interface ProductImage {
  src: string;
  alt: string;
}

export interface ProductDocument {
  id: string;
  name: string;
  kind: "spec_sheet" | "install_guide" | "warranty" | "care_guide";
  url: string;
  sizeKb: number;
}

export interface VariantOption {
  value: string;
  label: string;
  /** Hex swatch for colour options. */
  swatch?: string;
  skuSuffix?: string;
  /** Added to every price tier for this option. */
  priceAdjustment?: number;
  available?: boolean;
}

export interface VariantGroup {
  name: string;
  options: VariantOption[];
}

export interface ProductSpec {
  label: string;
  value: string;
}

export type ArtKind =
  | "vinyl"
  | "door"
  | "stairs"
  | "shower-base"
  | "shower-door"
  | "lock"
  | "toilet-seat"
  | "vanity"
  | "plumbing"
  | "shower-accessory"
  | "wpc-panel";

/** Parameters for the generated placeholder product illustrations. */
export interface ProductArt {
  kind: ArtKind;
  primary: string;
  secondary?: string;
  variant?: number;
}

export type ProductBadge = "new" | "best_seller" | "clearance" | "eco" | "exclusive";

export interface Product {
  id: string;
  slug: string;
  name: string;
  categoryId: string;
  subcategory?: string;
  sku: string;
  brand: string;
  shortDescription: string;
  description: string;
  features: string[];
  pricing: ProductPricing;
  inventory: ProductInventory;
  coverage?: CoverageInfo;
  attributes: {
    colour?: string;
    finish?: string;
    dimensions?: string;
    thickness?: string;
    material?: string;
  };
  specifications: ProductSpec[];
  installation?: string;
  warranty?: string;
  images: ProductImage[];
  art?: ProductArt;
  documents: ProductDocument[];
  variants: VariantGroup[];
  relatedIds: string[];
  accessoryIds: string[];
  minOrderQty?: number;
  /** Large/heavy items trigger "delivery fee to be confirmed". */
  oversized?: boolean;
  badges: ProductBadge[];
  featured: boolean;
  active: boolean;
  createdAt: ISODate;
  updatedAt: ISODate;
}

/* ----------------------------------------------------------------------------
 * Pricing as seen by a viewer (safe to send to the browser)
 * ------------------------------------------------------------------------- */

export type PriceKind = "retail" | "sale" | "contractor";

export type PriceView =
  | {
      mode: "price";
      amount: number;
      kind: PriceKind;
      /** Struck-through reference price (retail) when discounted. */
      compareAt?: number;
      unit: SellingUnit;
      savingsPercent?: number;
    }
  | {
      mode: "quote";
      reason: "no_price" | "hidden" | "contractors_only";
      unit: SellingUnit;
    };

/* ----------------------------------------------------------------------------
 * Cart, orders, fulfilment
 * ------------------------------------------------------------------------- */

export interface CartLine {
  productId: string;
  quantity: number;
  /** Map of variant group name -> option value. */
  options?: Record<string, string>;
}

export type FulfilmentMethod = "pickup" | "delivery";

export interface DeliveryZone {
  id: string;
  name: string;
  postalPrefixes: string[];
  fee: number;
  freeOver?: number;
  leadTime: string;
  active: boolean;
}

export interface PickupLocation {
  id: string;
  name: string;
  address: Address;
  hours: string;
  instructions: string;
  readyTime: string;
  active: boolean;
}

export type PaymentMethod = "card" | "apple_pay" | "google_pay" | "etransfer";
export type PaymentStatus = "paid" | "awaiting_payment" | "failed" | "refunded";

export type OrderStatus =
  | "awaiting_payment"
  | "processing"
  | "ready_for_pickup"
  | "out_for_delivery"
  | "completed"
  | "cancelled";

export interface OrderItem {
  productId: string;
  name: string;
  sku: string;
  optionsLabel?: string;
  quantity: number;
  unitPrice: number;
  priceKind: PriceKind;
  unit: SellingUnit;
  lineTotal: number;
}

export interface OrderHistoryEntry {
  status: OrderStatus;
  at: ISODate;
  note?: string;
  by?: string;
}

export interface Order {
  id: string;
  number: string;
  createdAt: ISODate;
  userId?: string;
  guest: boolean;
  customer: { fullName: string; email: string; phone: string; companyName?: string };
  billingAddress: Address;
  fulfilment:
    | { method: "pickup"; locationId: string; locationName: string; readyEstimate: string }
    | {
        method: "delivery";
        address: Address;
        zoneId?: string;
        zoneName?: string;
        feeToBeConfirmed: boolean;
        preferredDate?: string;
        instructions?: string;
      };
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  taxRate: number;
  taxLabel: string;
  tax: number;
  total: number;
  payment: {
    method: PaymentMethod;
    status: PaymentStatus;
    provider: string;
    reference: string;
    cardBrand?: string;
    last4?: string;
  };
  status: OrderStatus;
  history: OrderHistoryEntry[];
  notes?: string;
}

/* ----------------------------------------------------------------------------
 * Quotes
 * ------------------------------------------------------------------------- */

export type QuoteStatus =
  | "submitted"
  | "under_review"
  | "info_required"
  | "quoted"
  | "approved"
  | "declined";

export interface UploadedFile {
  id: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: ISODate;
  userId?: string;
  quoteId?: string;
  /** Demo seed files have no stored bytes. */
  demo?: boolean;
}

export interface QuoteItem {
  productId?: string;
  name: string;
  sku?: string;
  quantity: string;
  optionsLabel?: string;
  notes?: string;
}

export interface QuoteHistoryEntry {
  status: QuoteStatus;
  at: ISODate;
  note?: string;
  by?: string;
}

export interface Quote {
  id: string;
  reference: string;
  createdAt: ISODate;
  updatedAt: ISODate;
  status: QuoteStatus;
  source: "form" | "cart" | "product";
  userId?: string;
  customerType: "homeowner" | "contractor" | "business" | "designer";
  contact: {
    fullName: string;
    email: string;
    phone: string;
    companyName?: string;
    preferredContact: ContactMethod;
  };
  projectAddress: string;
  items: QuoteItem[];
  productsRequested: string;
  preferredStyles?: string;
  measurements?: string;
  installationRequired: boolean;
  fulfilment: FulfilmentMethod;
  preferredDate?: string;
  details?: string;
  fileIds: string[];
  quotedAmount?: number;
  adminNotes?: string;
  history: QuoteHistoryEntry[];
}

/* ----------------------------------------------------------------------------
 * Content, messages, notifications, settings
 * ------------------------------------------------------------------------- */

export interface ContactSubmission {
  id: string;
  createdAt: ISODate;
  name: string;
  email: string;
  phone?: string;
  topic: string;
  message: string;
  status: "new" | "in_progress" | "resolved";
}

export type EmailTemplate =
  | "account_registered"
  | "contractor_application_received"
  | "contractor_application_admin"
  | "contractor_approved"
  | "contractor_rejected"
  | "quote_received"
  | "quote_admin"
  | "quote_status"
  | "order_confirmation"
  | "order_admin"
  | "order_status"
  | "contact_admin"
  | "newsletter_signup";

export interface EmailLogEntry {
  id: string;
  createdAt: ISODate;
  template: EmailTemplate;
  to: string;
  subject: string;
  body: string;
  status: "simulated" | "sent" | "failed" | "disabled";
  relatedId?: string;
}

export interface Banner {
  id: string;
  placement: "announcement" | "hero" | "promo";
  eyebrow?: string;
  title: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
  theme: "dark" | "gold" | "light";
  active: boolean;
  sortOrder: number;
}

export interface SiteContent {
  heroEyebrow: string;
  heroTitle: string;
  heroBody: string;
  aboutTitle: string;
  aboutBody: string;
  contractorPitch: string;
  quotePitch: string;
}

export interface StoreSettings {
  taxRate: number;
  taxLabel: string;
  deliveryZones: DeliveryZone[];
  pickupLocations: PickupLocation[];
  /** Orders above this many oversized units get "delivery fee to be confirmed". */
  oversizedUnitThreshold: number;
  deliveryNotes: string;
  emailNotifications: Record<EmailTemplate, boolean>;
  adminNotificationEmail: string;
}

export interface Counters {
  quoteByYear: Record<string, number>;
  order: number;
}

export interface Database {
  version: number;
  seededAt: ISODate;
  users: User[];
  categories: Category[];
  products: Product[];
  orders: Order[];
  quotes: Quote[];
  uploads: UploadedFile[];
  contactSubmissions: ContactSubmission[];
  emailLog: EmailLogEntry[];
  banners: Banner[];
  content: SiteContent;
  settings: StoreSettings;
  counters: Counters;
  newsletter: { email: string; createdAt: ISODate }[];
}
