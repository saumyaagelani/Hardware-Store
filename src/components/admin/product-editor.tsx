"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { AlertCircle, CheckCircle2, ExternalLink, Plus, Trash2 } from "lucide-react";
import type { Category, Product, VariantGroup } from "@/lib/types";
import { saveProductAction, type ProductInput } from "@/app/actions/admin";
import { resolvePrice } from "@/lib/pricing";
import { statusFromQuantity, stockStatusOptions } from "@/lib/stock";
import { Checkbox, SelectField, TextField, TextareaField } from "@/components/ui/fields";
import { Button } from "@/components/ui/button";
import { PriceDisplay } from "@/components/product/price";
import { cn } from "@/lib/cn";

type Draft = Omit<ProductInput, "pricing" | "inventory"> & {
  pricing: { retail: string; sale: string; contractor: string; visibility: Product["pricing"]["visibility"]; unit: Product["pricing"]["unit"]; saleEndsAt: string };
  inventory: { status: Product["inventory"]["status"]; quantity: string; lowStockThreshold: string; restockDate: string; leadTime: string };
  coverage: string;
  minOrder: string;
};

const numOrNull = (v: string) => (v.trim() === "" ? null : Number(v));
const dateInput = (iso?: string) => (iso ? iso.slice(0, 10) : "");

function toDraft(p: Product | null): Draft {
  return {
    name: p?.name ?? "",
    slug: p?.slug ?? "",
    sku: p?.sku ?? "",
    brand: p?.brand ?? "",
    categoryId: p?.categoryId ?? "",
    subcategory: p?.subcategory ?? "",
    shortDescription: p?.shortDescription ?? "",
    description: p?.description ?? "",
    features: p?.features ?? [],
    pricing: {
      retail: p?.pricing.retail?.toString() ?? "",
      sale: p?.pricing.sale?.toString() ?? "",
      contractor: p?.pricing.contractor?.toString() ?? "",
      visibility: p?.pricing.visibility ?? "public",
      unit: p?.pricing.unit ?? "each",
      saleEndsAt: dateInput(p?.pricing.saleEndsAt),
    },
    inventory: {
      status: p?.inventory.status ?? "in_stock",
      quantity: String(p?.inventory.quantity ?? 0),
      lowStockThreshold: String(p?.inventory.lowStockThreshold ?? 10),
      restockDate: dateInput(p?.inventory.restockDate),
      leadTime: p?.inventory.leadTime ?? "",
    },
    coverage: p?.coverage?.perUnit?.toString() ?? "",
    coverageUnitLabel: p?.coverage?.unitLabel ?? "box",
    minOrder: p?.minOrderQty?.toString() ?? "",
    attributes: {
      colour: p?.attributes.colour ?? "",
      finish: p?.attributes.finish ?? "",
      dimensions: p?.attributes.dimensions ?? "",
      thickness: p?.attributes.thickness ?? "",
      material: p?.attributes.material ?? "",
    },
    specifications: p?.specifications ?? [],
    installation: p?.installation ?? "",
    warranty: p?.warranty ?? "",
    images: p?.images ?? [],
    documents: p?.documents ?? [],
    variants: p?.variants ?? [],
    relatedIds: p?.relatedIds ?? [],
    accessoryIds: p?.accessoryIds ?? [],
    oversized: p?.oversized ?? false,
    badges: p?.badges ?? [],
    featured: p?.featured ?? false,
    active: p?.active ?? true,
  };
}

function Card({ title, id, children, description }: { title: string; id?: string; children: React.ReactNode; description?: string }) {
  return (
    <section id={id} className="scroll-mt-20 rounded-lg border border-line bg-white p-5 sm:p-6">
      <h2 className="font-display text-lg font-bold text-ink">{title}</h2>
      {description ? <p className="mt-0.5 text-sm text-body">{description}</p> : null}
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function ProductEditor({ product, categories, allProducts }: { product: Product | null; categories: Category[]; allProducts: { id: string; name: string; sku: string }[] }) {
  const router = useRouter();
  const [d, setD] = useState<Draft>(() => toDraft(product));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  const category = categories.find((c) => c.id === d.categoryId);
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setMessage(null);
    setD((x) => ({ ...x, [key]: value }));
  };
  const setPricing = (k: keyof Draft["pricing"], v: string) => set("pricing", { ...d.pricing, [k]: v });
  const setInventory = (k: keyof Draft["inventory"], v: string) => set("inventory", { ...d.inventory, [k]: v });

  const pricingPreview = useMemo(() => {
    const pricing = { retail: numOrNull(d.pricing.retail), sale: numOrNull(d.pricing.sale), contractor: numOrNull(d.pricing.contractor), visibility: d.pricing.visibility, unit: d.pricing.unit, saleEndsAt: d.pricing.saleEndsAt || undefined };
    return {
      guest: resolvePrice(pricing, null),
      contractor: resolvePrice(pricing, { accountType: "contractor", contractorStatus: "approved" }),
      pending: resolvePrice(pricing, { accountType: "contractor", contractorStatus: "pending" }),
    };
  }, [d.pricing]);

  function save() {
    setErrors({});
    setMessage(null);
    const input: ProductInput = {
      ...d,
      pricing: {
        retail: numOrNull(d.pricing.retail),
        sale: numOrNull(d.pricing.sale),
        contractor: numOrNull(d.pricing.contractor),
        visibility: d.pricing.visibility,
        unit: d.pricing.unit,
        saleEndsAt: d.pricing.saleEndsAt,
      },
      inventory: {
        status: d.inventory.status,
        quantity: Number(d.inventory.quantity) || 0,
        lowStockThreshold: Number(d.inventory.lowStockThreshold) || 0,
        restockDate: d.inventory.restockDate,
        leadTime: d.inventory.leadTime,
      },
      coveragePerUnit: numOrNull(d.coverage),
      minOrderQty: numOrNull(d.minOrder),
    };
    start(async () => {
      const res = await saveProductAction(product?.id ?? null, input);
      if (res.ok) {
        setMessage({ ok: true, text: "Product saved — the storefront has been updated." });
        if (!product) router.push(`/admin/products/${res.id}?created=1`);
        else router.refresh();
      } else {
        setErrors(res.fieldErrors ?? {});
        setMessage({ ok: false, text: res.error ?? "Please fix the highlighted fields." });
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }

  const productOptions = allProducts.filter((p) => p.id !== product?.id);

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      className="grid gap-6 xl:grid-cols-[1fr_320px]"
    >
      <div className="min-w-0 space-y-6">
        {message ? (
          <p role="status" className={cn("flex items-center gap-2 rounded-md p-3 text-sm", message.ok ? "bg-success-soft text-success" : "bg-danger-soft text-danger")}>
            {message.ok ? <CheckCircle2 className="h-4 w-4" aria-hidden /> : <AlertCircle className="h-4 w-4" aria-hidden />} {message.text}
          </p>
        ) : null}

        <Card title="General" id="general">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField containerClassName="sm:col-span-2" label="Product name" required value={d.name} onChange={(e) => set("name", e.target.value)} error={errors.name} />
            <TextField label="SKU / product code" required value={d.sku} onChange={(e) => set("sku", e.target.value)} error={errors.sku} />
            <TextField label="Brand / manufacturer" required value={d.brand} onChange={(e) => set("brand", e.target.value)} error={errors.brand} />
            <SelectField label="Category" required placeholder="Select…" value={d.categoryId} onChange={(e) => set("categoryId", e.target.value)} options={categories.map((c) => ({ value: c.id, label: c.name }))} error={errors.categoryId} />
            <SelectField label="Subcategory" optional placeholder="None" value={d.subcategory ?? ""} onChange={(e) => set("subcategory", e.target.value)} options={(category?.subcategories ?? []).map((s) => ({ value: s.slug, label: s.name }))} />
            <TextField containerClassName="sm:col-span-2" label="URL slug" optional value={d.slug ?? ""} onChange={(e) => set("slug", e.target.value)} error={errors.slug} hint="Leave blank to generate from the name. Changing it changes the product URL." />
            <TextareaField containerClassName="sm:col-span-2" label="Short description" required rows={2} value={d.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} error={errors.shortDescription} />
            <TextareaField containerClassName="sm:col-span-2" label="Full description" rows={5} value={d.description ?? ""} onChange={(e) => set("description", e.target.value)} />
            <TextareaField
              containerClassName="sm:col-span-2"
              label="Key features"
              optional
              rows={4}
              hint="One feature per line"
              value={(d.features ?? []).join("\n")}
              onChange={(e) => set("features", e.target.value.split("\n"))}
            />
          </div>
        </Card>

        <Card title="Pricing" id="pricing" description="Contractor pricing is only shown to approved contractor accounts.">
          <div className="grid gap-4 sm:grid-cols-3">
            <TextField label="Retail price ($)" type="number" min={0} step="0.01" value={d.pricing.retail} onChange={(e) => setPricing("retail", e.target.value)} error={errors["pricing.retail"]} hint="Blank = no fixed price (Request a Quote)" />
            <TextField label="Sale price ($)" optional type="number" min={0} step="0.01" value={d.pricing.sale} onChange={(e) => setPricing("sale", e.target.value)} error={errors["pricing.sale"]} />
            <TextField label="Contractor price ($)" optional type="number" min={0} step="0.01" value={d.pricing.contractor} onChange={(e) => setPricing("contractor", e.target.value)} error={errors["pricing.contractor"]} />
            <SelectField
              label="Price visibility"
              value={d.pricing.visibility}
              onChange={(e) => setPricing("visibility", e.target.value)}
              options={[
                { value: "public", label: "Public — show prices" },
                { value: "contractors_only", label: "Approved contractors only" },
                { value: "hidden", label: "Hidden — Request a Quote" },
              ]}
            />
            <SelectField
              label="Selling unit"
              value={d.pricing.unit}
              onChange={(e) => setPricing("unit", e.target.value)}
              options={[
                { value: "each", label: "Each" },
                { value: "box", label: "Per box" },
                { value: "sqft", label: "Per sq. ft." },
                { value: "piece", label: "Per piece" },
                { value: "set", label: "Per set" },
                { value: "pack", label: "Per pack" },
              ]}
            />
            <TextField label="Sale ends" optional type="date" value={d.pricing.saleEndsAt} onChange={(e) => setPricing("saleEndsAt", e.target.value)} />
          </div>
          <div className="mt-5 grid gap-3 rounded-md bg-canvas p-4 sm:grid-cols-3">
            {(
              [
                ["Guests & retail customers", pricingPreview.guest],
                ["Pending / rejected contractors", pricingPreview.pending],
                ["Approved contractors", pricingPreview.contractor],
              ] as const
            ).map(([label, price]) => (
              <div key={label}>
                <p className="mb-1.5 text-xs font-semibold text-body">{label} see:</p>
                <PriceDisplay price={price} size="sm" />
              </div>
            ))}
          </div>
        </Card>

        <Card title="Inventory" id="inventory" description="Local stock data. Architecture is ready for a POS / inventory integration later.">
          <div className="grid gap-4 sm:grid-cols-3">
            <SelectField label="Stock status" value={d.inventory.status} onChange={(e) => setInventory("status", e.target.value)} options={stockStatusOptions} />
            <TextField
              label="Quantity on hand"
              type="number"
              min={0}
              value={d.inventory.quantity}
              onChange={(e) => {
                const q = Number(e.target.value) || 0;
                set("inventory", { ...d.inventory, quantity: e.target.value, status: statusFromQuantity(q, Number(d.inventory.lowStockThreshold) || 0, d.inventory.status) });
              }}
              hint="Status updates automatically from quantity"
            />
            <TextField label="Low-stock threshold" type="number" min={0} value={d.inventory.lowStockThreshold} onChange={(e) => setInventory("lowStockThreshold", e.target.value)} />
            <TextField label="Expected restock date" optional type="date" value={d.inventory.restockDate} onChange={(e) => setInventory("restockDate", e.target.value)} />
            <TextField label="Special-order lead time" optional value={d.inventory.leadTime} onChange={(e) => setInventory("leadTime", e.target.value)} placeholder="e.g. 2–3 weeks" />
            <TextField label="Minimum order quantity" optional type="number" min={1} value={d.minOrder} onChange={(e) => set("minOrder", e.target.value)} />
          </div>
          <Checkbox className="mt-4" label="Oversized item" description="Large orders of oversized items get “delivery fee to be confirmed”." checked={Boolean(d.oversized)} onChange={(e) => set("oversized", e.target.checked)} />
        </Card>

        <Card title="Specifications & measurements" id="specs">
          <div className="grid gap-4 sm:grid-cols-3">
            {(["colour", "finish", "material", "dimensions", "thickness"] as const).map((k) => (
              <TextField key={k} label={k.charAt(0).toUpperCase() + k.slice(1)} optional value={d.attributes?.[k] ?? ""} onChange={(e) => set("attributes", { ...d.attributes, [k]: e.target.value })} />
            ))}
            <TextField label="Coverage per unit (sq. ft.)" optional type="number" min={0} step="0.01" value={d.coverage} onChange={(e) => set("coverage", e.target.value)} hint="Enables the sq. ft. calculator" />
            <TextField label="Coverage unit label" optional value={d.coverageUnitLabel ?? ""} onChange={(e) => set("coverageUnitLabel", e.target.value)} placeholder="box, panel…" />
          </div>
          <p className="mt-6 mb-2 text-sm font-semibold text-ink">Specification table</p>
          <div className="space-y-2">
            {(d.specifications ?? []).map((s, i) => (
              <div key={i} className="flex gap-2">
                <input className="field-input min-h-10! py-2!" aria-label={`Spec ${i + 1} label`} placeholder="Label" value={s.label} onChange={(e) => set("specifications", d.specifications!.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
                <input className="field-input min-h-10! py-2!" aria-label={`Spec ${i + 1} value`} placeholder="Value" value={s.value} onChange={(e) => set("specifications", d.specifications!.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))} />
                <button type="button" onClick={() => set("specifications", d.specifications!.filter((_, j) => j !== i))} className="rounded-md px-2 text-body hover:text-danger" aria-label={`Remove spec ${i + 1}`}>
                  <Trash2 className="h-4 w-4" aria-hidden />
                </button>
              </div>
            ))}
            <button type="button" onClick={() => set("specifications", [...(d.specifications ?? []), { label: "", value: "" }])} className="inline-flex items-center gap-1 text-sm font-semibold text-ink">
              <Plus className="h-4 w-4" aria-hidden /> Add specification
            </button>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <TextareaField label="Installation information" optional rows={4} value={d.installation ?? ""} onChange={(e) => set("installation", e.target.value)} />
            <TextareaField label="Warranty information" optional rows={4} value={d.warranty ?? ""} onChange={(e) => set("warranty", e.target.value)} />
          </div>
        </Card>

        <VariantsEditor variants={d.variants ?? []} onChange={(v) => set("variants", v)} />

        <Card title="Images & documents" id="media" description="Use site paths (/…) or https:// URLs. Final product photography replaces the placeholder illustrations.">
          {errors.images ? <p className="field-error mb-2">{errors.images}</p> : null}
          <div className="space-y-2">
            {(d.images ?? []).map((img, i) => (
              <div key={i} className="flex items-center gap-2">
                <img src={img.src} alt="" className="h-10 w-10 shrink-0 rounded bg-mist object-cover ring-1 ring-line" />
                <input className="field-input min-h-10! py-2!" aria-label={`Image ${i + 1} URL`} value={img.src} onChange={(e) => set("images", d.images!.map((x, j) => (j === i ? { ...x, src: e.target.value } : x)))} />
                <input className="field-input min-h-10! py-2!" aria-label={`Image ${i + 1} alt text`} placeholder="Alt text" value={img.alt} onChange={(e) => set("images", d.images!.map((x, j) => (j === i ? { ...x, alt: e.target.value } : x)))} />
                <button type="button" onClick={() => set("images", d.images!.filter((_, j) => j !== i))} className="rounded-md px-2 text-body hover:text-danger" aria-label={`Remove image ${i + 1}`}>
                  <Trash2 className="h-4 w-4" aria-hidden />
                </button>
              </div>
            ))}
            <button type="button" onClick={() => set("images", [...(d.images ?? []), { src: "", alt: d.name }])} className="inline-flex items-center gap-1 text-sm font-semibold text-ink">
              <Plus className="h-4 w-4" aria-hidden /> Add image
            </button>
          </div>
          <p className="mt-6 mb-2 text-sm font-semibold text-ink">Technical documents</p>
          {errors.documents ? <p className="field-error mb-2">{errors.documents}</p> : null}
          <div className="space-y-2">
            {(d.documents ?? []).map((doc, i) => (
              <div key={i} className="grid gap-2 sm:grid-cols-[1fr_160px_1.4fr_auto]">
                <input className="field-input min-h-10! py-2!" aria-label={`Document ${i + 1} name`} value={doc.name} onChange={(e) => set("documents", d.documents!.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
                <select className="field-input min-h-10! py-2!" aria-label={`Document ${i + 1} type`} value={doc.kind} onChange={(e) => set("documents", d.documents!.map((x, j) => (j === i ? { ...x, kind: e.target.value as typeof doc.kind } : x)))}>
                  <option value="spec_sheet">Spec sheet</option>
                  <option value="install_guide">Install guide</option>
                  <option value="warranty">Warranty</option>
                  <option value="care_guide">Care guide</option>
                </select>
                <input className="field-input min-h-10! py-2!" aria-label={`Document ${i + 1} URL`} value={doc.url} onChange={(e) => set("documents", d.documents!.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))} />
                <button type="button" onClick={() => set("documents", d.documents!.filter((_, j) => j !== i))} className="rounded-md px-2 text-body hover:text-danger" aria-label={`Remove document ${i + 1}`}>
                  <Trash2 className="h-4 w-4" aria-hidden />
                </button>
              </div>
            ))}
            <button type="button" onClick={() => set("documents", [...(d.documents ?? []), { id: `doc${Date.now()}`, name: "Specification Sheet", kind: "spec_sheet", url: "", sizeKb: 0 }])} className="inline-flex items-center gap-1 text-sm font-semibold text-ink">
              <Plus className="h-4 w-4" aria-hidden /> Add document
            </button>
          </div>
        </Card>

        <Card title="Related products & accessories" id="relations">
          <div className="grid gap-5 md:grid-cols-2">
            <RelationPicker label="Related products" value={d.relatedIds ?? []} onChange={(v) => set("relatedIds", v)} options={productOptions} />
            <RelationPicker label="Accessories & complementary items" value={d.accessoryIds ?? []} onChange={(v) => set("accessoryIds", v)} options={productOptions} />
          </div>
        </Card>
      </div>

      <aside className="h-fit space-y-4 xl:sticky xl:top-20">
        <div className="rounded-lg border border-line bg-white p-5">
          <p className="font-display text-lg font-bold text-ink">Publish</p>
          <div className="mt-4 space-y-3">
            <Checkbox label="Active (visible in store)" checked={Boolean(d.active)} onChange={(e) => set("active", e.target.checked)} />
            <Checkbox label="Featured on homepage" checked={Boolean(d.featured)} onChange={(e) => set("featured", e.target.checked)} />
          </div>
          <p className="mt-5 mb-2 text-sm font-semibold text-ink">Badges</p>
          <div className="flex flex-wrap gap-2">
            {(["new", "best_seller", "clearance", "eco", "exclusive"] as const).map((b) => {
              const on = d.badges?.includes(b);
              return (
                <button key={b} type="button" aria-pressed={on} onClick={() => set("badges", on ? d.badges!.filter((x) => x !== b) : [...(d.badges ?? []), b])} className={cn("rounded-full border px-3 py-1 text-xs font-semibold capitalize", on ? "border-ink bg-ink text-white" : "border-line text-body hover:border-ink")}>
                  {b.replace("_", " ")}
                </button>
              );
            })}
          </div>
          <Button type="submit" className="mt-6 w-full" loading={pending}>
            {product ? "Save changes" : "Create product"}
          </Button>
          {product ? (
            <Link href={`/products/${product.slug}`} target="_blank" className="mt-3 flex items-center justify-center gap-1.5 text-sm font-semibold text-ink hover:underline">
              View in store <ExternalLink className="h-4 w-4" aria-hidden />
            </Link>
          ) : null}
        </div>
        <nav aria-label="Editor sections" className="hidden rounded-lg border border-line bg-white p-3 text-sm xl:block">
          {[
            ["general", "General"],
            ["pricing", "Pricing"],
            ["inventory", "Inventory"],
            ["specs", "Specifications"],
            ["variants", "Variations"],
            ["media", "Images & documents"],
            ["relations", "Related products"],
          ].map(([id, label]) => (
            <a key={id} href={`#${id}`} className="block rounded px-2 py-1.5 text-body hover:bg-mist hover:text-ink">
              {label}
            </a>
          ))}
        </nav>
      </aside>
    </form>
  );
}

function RelationPicker({ label, value, onChange, options }: { label: string; value: string[]; onChange: (v: string[]) => void; options: { id: string; name: string; sku: string }[] }) {
  const [adding, setAdding] = useState("");
  const byId = new Map(options.map((o) => [o.id, o]));
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-ink">{label}</p>
      <ul className="mb-2 space-y-1.5">
        {value.map((id) => (
          <li key={id} className="flex items-center justify-between gap-2 rounded-md bg-canvas px-3 py-2 text-sm">
            <span className="truncate text-ink">{byId.get(id)?.name ?? id}</span>
            <button type="button" onClick={() => onChange(value.filter((x) => x !== id))} className="text-body hover:text-danger" aria-label={`Remove ${byId.get(id)?.name ?? id}`}>
              <Trash2 className="h-4 w-4" aria-hidden />
            </button>
          </li>
        ))}
        {!value.length ? <li className="text-sm text-body">None selected</li> : null}
      </ul>
      <div className="flex gap-2">
        <select className="field-input min-h-10! py-2!" value={adding} onChange={(e) => setAdding(e.target.value)} aria-label={`Add to ${label}`}>
          <option value="">Add a product…</option>
          {options
            .filter((o) => !value.includes(o.id))
            .map((o) => (
              <option key={o.id} value={o.id}>
                {o.name} ({o.sku})
              </option>
            ))}
        </select>
        <Button
          size="sm"
          variant="outline"
          className="h-10!"
          disabled={!adding}
          onClick={() => {
            onChange([...value, adding]);
            setAdding("");
          }}
        >
          Add
        </Button>
      </div>
    </div>
  );
}

function VariantsEditor({ variants, onChange }: { variants: VariantGroup[]; onChange: (v: VariantGroup[]) => void }) {
  const update = (gi: number, group: VariantGroup) => onChange(variants.map((g, i) => (i === gi ? group : g)));
  return (
    <Card title="Product variations" id="variants" description="Options customers choose from, such as colour, size or handing. Price adjustments apply to all price tiers.">
      <div className="space-y-5">
        {variants.map((group, gi) => (
          <div key={gi} className="rounded-md border border-line p-4">
            <div className="mb-3 flex items-center gap-2">
              <input className="field-input min-h-10! py-2! font-semibold" aria-label={`Variation ${gi + 1} name`} value={group.name} onChange={(e) => update(gi, { ...group, name: e.target.value })} placeholder="e.g. Colour" />
              <button type="button" onClick={() => onChange(variants.filter((_, i) => i !== gi))} className="rounded-md px-2 text-body hover:text-danger" aria-label={`Remove variation ${group.name}`}>
                <Trash2 className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <div className="space-y-2">
              <div className="hidden grid-cols-[1fr_90px_110px_auto] gap-2 text-xs font-semibold text-body sm:grid">
                <span>Option label</span>
                <span>Swatch</span>
                <span>Price +/- ($)</span>
                <span className="w-8" />
              </div>
              {group.options.map((o, oi) => (
                <div key={oi} className="grid grid-cols-[1fr_90px_110px_auto] gap-2">
                  <input
                    className="field-input min-h-9! py-1.5!"
                    aria-label="Option label"
                    value={o.label}
                    onChange={(e) => update(gi, { ...group, options: group.options.map((x, j) => (j === oi ? { ...x, label: e.target.value, value: x.value || e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-") } : x)) })}
                  />
                  <input
                    type="color"
                    className="h-9 w-full cursor-pointer rounded-md border border-line"
                    aria-label="Swatch colour"
                    value={o.swatch ?? "#ffffff"}
                    onChange={(e) => update(gi, { ...group, options: group.options.map((x, j) => (j === oi ? { ...x, swatch: e.target.value } : x)) })}
                  />
                  <input
                    type="number"
                    step="0.01"
                    className="field-input min-h-9! py-1.5!"
                    aria-label="Price adjustment"
                    value={o.priceAdjustment ?? ""}
                    onChange={(e) => update(gi, { ...group, options: group.options.map((x, j) => (j === oi ? { ...x, priceAdjustment: e.target.value === "" ? undefined : Number(e.target.value) } : x)) })}
                  />
                  <button type="button" onClick={() => update(gi, { ...group, options: group.options.filter((_, j) => j !== oi) })} className="w-8 text-body hover:text-danger" aria-label={`Remove option ${o.label}`}>
                    <Trash2 className="mx-auto h-4 w-4" aria-hidden />
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => update(gi, { ...group, options: [...group.options, { value: `option-${group.options.length + 1}`, label: "" }] })} className="inline-flex items-center gap-1 text-sm font-semibold text-ink">
                <Plus className="h-4 w-4" aria-hidden /> Add option
              </button>
            </div>
          </div>
        ))}
        <Button size="sm" variant="outline" onClick={() => onChange([...variants, { name: "", options: [{ value: "option-1", label: "" }] }])}>
          <Plus className="h-4 w-4" aria-hidden /> Add variation
        </Button>
      </div>
    </Card>
  );
}
