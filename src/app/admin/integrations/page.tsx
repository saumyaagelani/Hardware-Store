import type { Metadata } from "next";
import { CheckCircle2, CircleDashed } from "lucide-react";
import { requireStaff } from "@/server/auth/session";
import { env } from "@/config/env";
import { isPersistent } from "@/server/db";
import { AdminHeader } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Integrations" };

export default async function IntegrationsPage() {
  await requireStaff("settings");
  const items = [
    { name: "Payments (Stripe or similar)", status: "Demo mode", ready: false, detail: "Mock payment provider with test cards. Set STRIPE_SECRET_KEY / NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY and implement the provider in server/services/payments.ts." },
    { name: "Email delivery", status: "Simulated", ready: false, detail: "Notifications are logged to Admin → Email notifications. Set EMAIL_PROVIDER and API key in Stage 2." },
    { name: "Google Analytics 4", status: env.gaId ? "Configured" : "Not configured", ready: Boolean(env.gaId), detail: "NEXT_PUBLIC_GA_MEASUREMENT_ID — ecommerce events (add_to_cart, begin_checkout, purchase, generate_lead) are already wired." },
    { name: "Meta / Facebook Pixel", status: env.metaPixelId ? "Configured" : "Not configured", ready: Boolean(env.metaPixelId), detail: "NEXT_PUBLIC_META_PIXEL_ID" },
    { name: "Google Search Console", status: env.searchConsoleVerification ? "Configured" : "Not configured", ready: Boolean(env.searchConsoleVerification), detail: "NEXT_PUBLIC_GSC_VERIFICATION meta tag. Sitemap at /sitemap.xml." },
    { name: "Data store", status: isPersistent() ? "Local JSON file" : "In-memory", ready: true, detail: "Prototype store in DATA_DIR. Replace with Postgres (or similar) behind the same service layer in Stage 2." },
    { name: "File storage", status: "Local disk", ready: true, detail: "Uploads are validated and stored privately in DATA_DIR/uploads. Move to S3/R2 with virus scanning for production." },
    { name: "POS / inventory sync", status: "Not connected", ready: false, detail: "Products carry an externalId field reserved for POS/inventory mapping." },
    { name: "QuickBooks / accounting", status: "Not connected", ready: false, detail: "Orders include structured line items, tax and payment references for future export." },
    { name: "CRM & email marketing", status: "Not connected", ready: false, detail: "Newsletter signups and customer opt-ins are captured for future sync." },
    { name: "SMS notifications", status: "Not connected", ready: false, detail: "Customers can already choose “text” as their preferred contact method." },
    { name: "Facebook / Instagram catalogue", status: "Not connected", ready: false, detail: "Product data (SKU, price, images, availability) is structured for a catalogue feed." },
  ];
  return (
    <>
      <AdminHeader title="Integrations" description="Status of production services. None are required for the prototype to run." />
      <ul className="grid gap-3 lg:grid-cols-2">
        {items.map((i) => (
          <li key={i.name} className="flex gap-3 rounded-lg border border-line bg-white p-5">
            {i.ready ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden /> : <CircleDashed className="mt-0.5 h-5 w-5 shrink-0 text-muted" aria-hidden />}
            <div>
              <p className="font-semibold text-ink">
                {i.name} <span className="ml-1 text-xs font-medium text-body">· {i.status}</span>
              </p>
              <p className="mt-1 text-sm text-body">{i.detail}</p>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
