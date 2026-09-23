"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { AlertCircle, FileText, ShoppingCart, Trash2 } from "lucide-react";
import type { ContactMethod } from "@/lib/types";
import { submitQuoteAction } from "@/app/actions/quote";
import { track } from "@/lib/analytics";
import { formatMoney } from "@/lib/format";
import { usePricedCart } from "@/components/cart/use-priced-cart";
import { useCart } from "@/components/cart/cart-provider";
import { ChoiceCards, SelectField, TextField, TextareaField } from "@/components/ui/fields";
import { Button } from "@/components/ui/button";
import { FileUploader, type UploadedItem } from "./file-uploader";

export interface QuotePrefill {
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  projectAddress: string;
  customerType: "homeowner" | "contractor" | "business" | "designer";
  preferredContact: ContactMethod;
  signedIn: boolean;
}

export interface QuoteProductPrefill {
  id: string;
  name: string;
  sku: string;
  slug: string;
  image?: string;
  optionsLabel?: string;
  quantity: string;
}

interface ItemRow {
  productId?: string;
  name: string;
  sku?: string;
  quantity: string;
  optionsLabel?: string;
  image?: string;
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-line pt-7 first:border-t-0 first:pt-0">
      <h2 className="font-display text-xl font-bold text-ink">{title}</h2>
      {description ? <p className="mt-1 text-sm text-body">{description}</p> : null}
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function QuoteForm({
  prefill,
  product,
  fromCart,
  initialProducts,
}: {
  prefill: QuotePrefill;
  product?: QuoteProductPrefill;
  fromCart: boolean;
  initialProducts?: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const { lines } = useCart();
  const { snapshot } = usePricedCart(fromCart);
  const [form, setForm] = useState({
    fullName: prefill.fullName,
    email: prefill.email,
    phone: prefill.phone,
    companyName: prefill.companyName,
    projectAddress: prefill.projectAddress,
    customerType: prefill.customerType,
    productsRequested: initialProducts ?? "",
    preferredStyles: "",
    quantities: "",
    measurements: "",
    installationRequired: "no" as "yes" | "no",
    fulfilment: "delivery" as "delivery" | "pickup",
    preferredDate: "",
    details: "",
    preferredContact: prefill.preferredContact,
  });
  const [items, setItems] = useState<ItemRow[]>(
    product ? [{ productId: product.id, name: product.name, sku: product.sku, quantity: product.quantity, optionsLabel: product.optionsLabel, image: product.image }] : [],
  );
  const [files, setFiles] = useState<UploadedItem[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  // Pull the cart into the item list once it has been priced.
  const [cartLoaded, setCartLoaded] = useState(false);
  useEffect(() => {
    if (!fromCart || cartLoaded || !snapshot) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time import of the cart into the form
    setItems(
      snapshot.lines.map((l) => ({
        productId: l.productId,
        name: l.name,
        sku: l.sku,
        quantity: String(l.quantity),
        optionsLabel: l.optionsLabel,
        image: l.image?.src,
      })),
    );
    setCartLoaded(true);
  }, [fromCart, cartLoaded, snapshot]);

  const set = <K extends keyof typeof form>(key: K) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const cartValue = snapshot?.totals.subtotal ?? 0;

  function submit() {
    setErrors({});
    setFormError(null);
    start(async () => {
      const res = await submitQuoteAction({
        ...form,
        fileIds: files.map((f) => f.id),
        source: fromCart ? "cart" : product ? "product" : "form",
        items: items.map(({ productId, name, sku, quantity, optionsLabel }) => ({ productId, name, sku, quantity: quantity || "1", optionsLabel })),
      });
      if (res.ok) {
        track("generate_lead", { form: "quote", source: fromCart ? "cart" : "form" });
        router.push(`/quote/confirmation/${res.quoteId}`);
      } else {
        setErrors(res.fieldErrors ?? {});
        setFormError(res.error ?? "Please check the highlighted fields.");
        document.getElementById("quote-form-top")?.scrollIntoView({ behavior: "smooth" });
      }
    });
  }

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="space-y-8"
    >
      <div id="quote-form-top" />
      {formError ? (
        <div role="alert" className="flex items-start gap-3 rounded-lg border border-danger/30 bg-danger-soft p-4 text-sm text-danger">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
          <p className="font-medium">{formError}</p>
        </div>
      ) : null}

      <Section title="Your details" description={prefill.signedIn ? "We've filled in what we know from your account." : "No account needed — we'll reply using your preferred contact method."}>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Full name" required autoComplete="name" value={form.fullName} onChange={set("fullName")} error={errors.fullName} />
          <TextField label="Email" type="email" required autoComplete="email" value={form.email} onChange={set("email")} error={errors.email} />
          <TextField label="Phone" type="tel" required autoComplete="tel" value={form.phone} onChange={set("phone")} error={errors.phone} />
          <TextField label="Company" optional autoComplete="organization" value={form.companyName} onChange={set("companyName")} />
          <SelectField
            label="I am a…"
            required
            value={form.customerType}
            onChange={set("customerType")}
            options={[
              { value: "homeowner", label: "Homeowner" },
              { value: "contractor", label: "Contractor / trade" },
              { value: "business", label: "Business / property manager" },
              { value: "designer", label: "Designer / architect" },
            ]}
          />
          <SelectField
            label="Preferred contact method"
            required
            value={form.preferredContact}
            onChange={set("preferredContact")}
            options={[
              { value: "email", label: "Email" },
              { value: "phone", label: "Phone call" },
              { value: "text", label: "Text message" },
            ]}
          />
          <TextField containerClassName="sm:col-span-2" label="Project address" required autoComplete="street-address" value={form.projectAddress} onChange={set("projectAddress")} error={errors.projectAddress} hint="Street and city, or just the city/area if you prefer." />
        </div>
      </Section>

      <Section title="Products" description="Tell us what you need. Add items from your cart or a product page, or describe it in your own words.">
        {items.length ? (
          <div className="mb-5 overflow-hidden rounded-lg border border-line">
            <div className="flex items-center justify-between bg-canvas px-4 py-2.5 text-xs font-semibold tracking-wide text-body uppercase">
              <span className="flex items-center gap-2">
                {fromCart ? <ShoppingCart className="h-4 w-4" aria-hidden /> : <FileText className="h-4 w-4" aria-hidden />}
                {fromCart ? "Items from your cart" : "Selected items"}
              </span>
              {fromCart && cartValue ? <span className="normal-case">Cart value {formatMoney(cartValue)}</span> : null}
            </div>
            <ul className="divide-y divide-line">
              {items.map((item, i) => (
                <li key={`${item.productId}-${i}`} className="flex items-center gap-3 px-4 py-3">
                  {item.image ? <img src={item.image} alt="" className="h-12 w-12 shrink-0 rounded-md bg-mist object-cover ring-1 ring-line" /> : null}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{item.name}</p>
                    <p className="text-xs text-body">
                      {item.sku ? `SKU ${item.sku}` : ""}
                      {item.optionsLabel ? ` · ${item.optionsLabel}` : ""}
                    </p>
                  </div>
                  <label className="sr-only" htmlFor={`qty-${i}`}>
                    Quantity for {item.name}
                  </label>
                  <input
                    id={`qty-${i}`}
                    value={item.quantity}
                    onChange={(e) => setItems((all) => all.map((x, idx) => (idx === i ? { ...x, quantity: e.target.value.slice(0, 40) } : x)))}
                    className="field-input min-h-9! w-24 py-1.5! text-center"
                    placeholder="Qty"
                  />
                  <button type="button" onClick={() => setItems((all) => all.filter((_, idx) => idx !== i))} className="rounded p-1.5 text-body hover:text-danger" aria-label={`Remove ${item.name}`}>
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : fromCart && lines.length === 0 ? (
          <p className="mb-5 rounded-md bg-mist p-3 text-sm text-body">
            Your cart is empty — describe the products below or <Link href="/shop" className="font-semibold text-ink underline">browse products</Link> first.
          </p>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <TextareaField
            containerClassName="sm:col-span-2"
            label={items.length ? "Anything else you need?" : "Products required"}
            required={!items.length}
            value={form.productsRequested}
            onChange={set("productsRequested")}
            error={errors.productsRequested}
            rows={3}
            placeholder="e.g. Waterproof vinyl for a 700 sq. ft. basement, stair nosing for 13 steps, two 30&quot; vanities…"
          />
          <TextField label="Preferred colours / styles" optional value={form.preferredStyles} onChange={set("preferredStyles")} placeholder="e.g. light oak, matte black hardware" />
          <TextField label="Quantities" optional value={form.quantities} onChange={set("quantities")} placeholder="e.g. 30 boxes, 6 doors" />
          <TextField containerClassName="sm:col-span-2" label="Measurements / square footage" optional value={form.measurements} onChange={set("measurements")} placeholder="e.g. Kitchen 12 × 14 ft, hallway 4 × 20 ft" />
        </div>
      </Section>

      <Section title="Project details">
        <div className="grid gap-5">
          <ChoiceCards
            name="installation"
            legend="Is installation required?"
            value={form.installationRequired}
            onChange={(v) => setForm((f) => ({ ...f, installationRequired: v }))}
            options={[
              { value: "no", label: "No — supply only", description: "I have my own installer or I'm doing it myself." },
              { value: "yes", label: "Yes — please quote installation", description: "We'll connect you with an installer where available." },
            ]}
          />
          <ChoiceCards
            name="fulfilment"
            legend="Delivery or pickup?"
            value={form.fulfilment}
            onChange={(v) => setForm((f) => ({ ...f, fulfilment: v }))}
            options={[
              { value: "delivery", label: "Delivery to project", description: "Delivery fee included in your quote." },
              { value: "pickup", label: "I'll pick up", description: "Free pickup from our warehouse." },
            ]}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Preferred project date" optional type="date" value={form.preferredDate} onChange={set("preferredDate")} hint="Approximate start or delivery date." />
          </div>
          <TextareaField label="Additional project details" optional value={form.details} onChange={set("details")} rows={4} placeholder="Subfloor type, access restrictions, timelines, budget…" />
        </div>
      </Section>

      <Section title="Photos, plans & documents" description="Optional, but they help us quote accurately and faster.">
        <FileUploader value={files} onChange={setFiles} />
      </Section>

      <div className="flex flex-col gap-3 border-t border-line pt-7 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-body">
          By submitting you agree to be contacted about this request. See our <Link href="/policies/privacy" className="underline">privacy policy</Link>.
        </p>
        <Button type="submit" size="lg" loading={pending}>
          Submit quote request
        </Button>
      </div>
    </form>
  );
}
