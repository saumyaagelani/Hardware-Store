"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";
import { AlertCircle, CheckCircle2, Plus, Trash2 } from "lucide-react";
import type { Banner, DeliveryZone, EmailTemplate, PickupLocation, SiteContent } from "@/lib/types";
import { deleteBannerAction, saveBannerAction, saveContentAction, saveDeliverySettingsAction, saveEmailSettingsAction, savePickupLocationsAction } from "@/app/actions/admin";
import { estimateDelivery } from "@/lib/cart";
import { formatMoney } from "@/lib/format";
import { AddressFields } from "@/components/forms/address-fields";
import { Checkbox, SelectField, TextField, TextareaField } from "@/components/ui/fields";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

function useSave() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const run = (fn: () => Promise<{ ok: boolean; error?: string; fieldErrors?: Record<string, string> }>, success = "Saved — changes are live on the storefront.") =>
    start(async () => {
      const res = await fn();
      setErrors(res.ok ? {} : (res.fieldErrors ?? {}));
      setStatus(res.ok ? { ok: true, text: success } : { ok: false, text: res.error ?? Object.values(res.fieldErrors ?? {})[0] ?? "Please check the form." });
      if (res.ok) router.refresh();
    });
  return { pending, status, errors, run, clear: () => setStatus(null) };
}

function SaveBar({ pending, status, label = "Save changes" }: { pending: boolean; status: { ok: boolean; text: string } | null; label?: string }) {
  return (
    <div className="sticky bottom-0 z-10 -mx-4 mt-6 flex items-center justify-end gap-4 border-t border-line bg-white/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-lg sm:border">
      {status ? (
        <p className={cn("flex items-center gap-1.5 text-sm", status.ok ? "text-success" : "text-danger")} role="status">
          {status.ok ? <CheckCircle2 className="h-4 w-4" aria-hidden /> : <AlertCircle className="h-4 w-4" aria-hidden />} {status.text}
        </p>
      ) : null}
      <Button type="submit" loading={pending}>
        {label}
      </Button>
    </div>
  );
}

function Card({ title, children, actions }: { title: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <section className="rounded-lg border border-line bg-white p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-bold text-ink">{title}</h2>
        {actions}
      </div>
      {children}
    </section>
  );
}

/* ------------------------------- Delivery ------------------------------- */

type ZoneDraft = Omit<DeliveryZone, "postalPrefixes" | "fee" | "freeOver"> & { postalPrefixes: string; fee: string; freeOver: string };

export function DeliverySettingsForm({ zones, oversizedUnitThreshold, deliveryNotes, taxRate, taxLabel }: { zones: DeliveryZone[]; oversizedUnitThreshold: number; deliveryNotes: string; taxRate: number; taxLabel: string }) {
  const { pending, status, errors, run } = useSave();
  const [list, setList] = useState<ZoneDraft[]>(zones.map((z) => ({ ...z, postalPrefixes: z.postalPrefixes.join(", "), fee: String(z.fee), freeOver: z.freeOver?.toString() ?? "" })));
  const [threshold, setThreshold] = useState(String(oversizedUnitThreshold));
  const [notes, setNotes] = useState(deliveryNotes);
  const [tax, setTax] = useState(String(Math.round(taxRate * 10000) / 100));
  const [label, setLabel] = useState(taxLabel);
  const [testPostal, setTestPostal] = useState("");
  const parsedZones = list.map((z) => ({ ...z, postalPrefixes: z.postalPrefixes.split(/[\s,]+/).filter(Boolean), fee: Number(z.fee) || 0, freeOver: z.freeOver ? Number(z.freeOver) : undefined }));
  const test = testPostal ? estimateDelivery(testPostal, [], 0, { deliveryZones: parsedZones, oversizedUnitThreshold: Number(threshold) || 0 }) : null;
  const upd = (i: number, patch: Partial<ZoneDraft>) => setList((all) => all.map((z, j) => (j === i ? { ...z, ...patch } : z)));

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        run(() =>
          saveDeliverySettingsAction({
            zones: parsedZones.map((z) => ({ ...z, freeOver: z.freeOver ?? null })),
            oversizedUnitThreshold: Number(threshold) || 0,
            deliveryNotes: notes,
            taxRate: (Number(tax) || 0) / 100,
            taxLabel: label,
          }),
        );
      }}
      className="space-y-6"
    >
      <Card
        title="Delivery zones"
        actions={
          <Button size="sm" variant="outline" onClick={() => setList([...list, { id: "", name: "New zone", postalPrefixes: "", fee: "0", freeOver: "", leadTime: "2–4 business days", active: true }])}>
            <Plus className="h-4 w-4" aria-hidden /> Add zone
          </Button>
        }
      >
        <p className="mb-4 text-sm text-body">Zones match the start of a postal code (e.g. “M” or “L5A”). The most specific prefix wins. Placeholder zones — replace with the confirmed service area.</p>
        <div className="space-y-4">
          {list.map((z, i) => (
            <div key={i} className="rounded-md border border-line p-4">
              <div className="grid gap-3 md:grid-cols-6">
                <TextField containerClassName="md:col-span-2" label="Zone name" value={z.name} onChange={(e) => upd(i, { name: e.target.value })} error={errors[`zones.${i}.name`]} />
                <TextField containerClassName="md:col-span-2" label="Postal prefixes" value={z.postalPrefixes} onChange={(e) => upd(i, { postalPrefixes: e.target.value.toUpperCase() })} hint="Comma separated" error={errors[`zones.${i}.postalPrefixes`] ?? Object.entries(errors).find(([k]) => k.startsWith(`zones.${i}.postalPrefixes.`))?.[1]} />
                <TextField label="Fee ($)" type="number" min={0} value={z.fee} onChange={(e) => upd(i, { fee: e.target.value })} />
                <TextField label="Free over ($)" optional type="number" min={0} value={z.freeOver} onChange={(e) => upd(i, { freeOver: e.target.value })} />
                <TextField containerClassName="md:col-span-2" label="Lead time" value={z.leadTime} onChange={(e) => upd(i, { leadTime: e.target.value })} />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <Checkbox label="Active" checked={z.active} onChange={(e) => upd(i, { active: e.target.checked })} />
                <button type="button" onClick={() => setList(list.filter((_, j) => j !== i))} className="inline-flex items-center gap-1 text-sm text-body hover:text-danger">
                  <Trash2 className="h-4 w-4" aria-hidden /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-md bg-canvas p-4">
          <label htmlFor="zone-test" className="text-sm font-semibold text-ink">
            Test a postal code
          </label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
            <input id="zone-test" value={testPostal} onChange={(e) => setTestPostal(e.target.value.toUpperCase())} placeholder="e.g. L5A 1B2" className="field-input min-h-10! py-2! sm:w-48" />
            {test ? <p className="text-sm text-ink">{test.status === "ok" ? `${test.zone.name} — ${formatMoney(test.fee)} (${test.zone.leadTime})` : test.message}</p> : null}
          </div>
        </div>
      </Card>
      <Card title="Large orders, tax & notes">
        <div className="grid gap-4 md:grid-cols-3">
          <TextField label="Oversized unit threshold" type="number" min={0} value={threshold} onChange={(e) => setThreshold(e.target.value)} hint="More oversized units than this → “Delivery fee to be confirmed”" />
          <TextField label="Sales tax rate (%)" type="number" min={0} max={30} step="0.01" value={tax} onChange={(e) => setTax(e.target.value)} />
          <TextField label="Tax label" value={label} onChange={(e) => setLabel(e.target.value)} error={errors.taxLabel} />
          <TextareaField containerClassName="md:col-span-3" label="Delivery notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
      </Card>
      <SaveBar pending={pending} status={status} />
    </form>
  );
}

/* -------------------------------- Pickup -------------------------------- */

export function PickupSettingsForm({ locations }: { locations: PickupLocation[] }) {
  const { pending, status, errors, run } = useSave();
  const [list, setList] = useState(locations.map((l) => ({ ...l, address: { ...l.address, line2: l.address.line2 ?? "" } })));
  const upd = (i: number, patch: Partial<(typeof list)[number]>) => setList((all) => all.map((l, j) => (j === i ? { ...l, ...patch } : l)));
  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        run(() => savePickupLocationsAction(list));
      }}
      className="space-y-6"
    >
      {list.map((l, i) => (
        <Card
          key={i}
          title={l.name || `Location ${i + 1}`}
          actions={
            list.length > 1 ? (
              <button type="button" onClick={() => setList(list.filter((_, j) => j !== i))} className="inline-flex items-center gap-1 text-sm text-body hover:text-danger">
                <Trash2 className="h-4 w-4" aria-hidden /> Remove
              </button>
            ) : null
          }
        >
          <div className="grid gap-4 md:grid-cols-2">
            <TextField label="Location name" value={l.name} onChange={(e) => upd(i, { name: e.target.value })} error={errors[`${i}.name`]} />
            <TextField label="Estimated readiness" value={l.readyTime} onChange={(e) => upd(i, { readyTime: e.target.value })} hint="e.g. Within 2 business hours" />
            <TextField containerClassName="md:col-span-2" label="Pickup hours" value={l.hours} onChange={(e) => upd(i, { hours: e.target.value })} />
            <TextareaField containerClassName="md:col-span-2" label="Pickup instructions" rows={2} value={l.instructions} onChange={(e) => upd(i, { instructions: e.target.value })} />
          </div>
          <p className="mt-5 mb-3 text-sm font-semibold text-ink">Address</p>
          <AddressFields prefix={`${i}.address`} value={l.address} onChange={(address) => upd(i, { address: { ...address } })} errors={errors} />
          <Checkbox className="mt-4" label="Offer this location at checkout" checked={l.active} onChange={(e) => upd(i, { active: e.target.checked })} />
        </Card>
      ))}
      <Button
        variant="outline"
        onClick={() => setList([...list, { id: "", name: "", address: { line1: "", line2: "", city: "", province: "ON", postalCode: "", country: "Canada" }, hours: "", instructions: "", readyTime: "Within 2 business hours", active: true }])}
      >
        <Plus className="h-4 w-4" aria-hidden /> Add pickup location
      </Button>
      <SaveBar pending={pending} status={status} />
    </form>
  );
}

/* ------------------------------- Banners ------------------------------- */

export function BannerEditor({ banner }: { banner?: Banner }) {
  const { pending, status, errors, run } = useSave();
  const router = useRouter();
  const [b, setB] = useState<Omit<Banner, "id"> & { id?: string }>(
    banner ?? { placement: "promo", eyebrow: "", title: "", body: "", ctaLabel: "Shop now", ctaHref: "/shop", theme: "dark", active: true, sortOrder: 10 },
  );
  const set = <K extends keyof typeof b>(k: K, v: (typeof b)[K]) => setB((x) => ({ ...x, [k]: v }));
  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        run(() => saveBannerAction(b));
        if (!banner) setB({ ...b, title: "", body: "", eyebrow: "" });
      }}
      className={cn("rounded-lg border bg-white p-5", b.active ? "border-line" : "border-dashed border-muted opacity-80")}
    >
      <div className="grid gap-3 md:grid-cols-4">
        <SelectField
          label="Placement"
          value={b.placement}
          onChange={(e) => set("placement", e.target.value as Banner["placement"])}
          options={[
            { value: "announcement", label: "Announcement bar" },
            { value: "promo", label: "Homepage promo tile" },
          ]}
        />
        <SelectField
          label="Style"
          value={b.theme}
          onChange={(e) => set("theme", e.target.value as Banner["theme"])}
          options={[
            { value: "dark", label: "Dark" },
            { value: "gold", label: "Gold" },
            { value: "light", label: "Light" },
          ]}
        />
        <TextField label="Order" type="number" min={0} value={String(b.sortOrder)} onChange={(e) => set("sortOrder", Number(e.target.value) || 0)} />
        <div className="flex items-end pb-2">
          <Checkbox label="Active" checked={b.active} onChange={(e) => set("active", e.target.checked)} />
        </div>
        {b.placement === "promo" ? <TextField label="Eyebrow" optional value={b.eyebrow ?? ""} onChange={(e) => set("eyebrow", e.target.value)} /> : null}
        <TextField containerClassName={b.placement === "promo" ? "md:col-span-3" : "md:col-span-4"} label="Title" value={b.title} onChange={(e) => set("title", e.target.value)} error={errors.title} />
        {b.placement === "promo" ? <TextField containerClassName="md:col-span-4" label="Body" optional value={b.body ?? ""} onChange={(e) => set("body", e.target.value)} /> : null}
        <TextField containerClassName="md:col-span-2" label="Button / link label" optional value={b.ctaLabel ?? ""} onChange={(e) => set("ctaLabel", e.target.value)} />
        <TextField containerClassName="md:col-span-2" label="Link" optional value={b.ctaHref ?? ""} onChange={(e) => set("ctaHref", e.target.value)} error={errors.ctaHref} hint="Site path, e.g. /deals" />
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
        {status ? <p className={cn("text-sm", status.ok ? "text-success" : "text-danger")}>{status.ok ? "Saved" : status.text}</p> : null}
        {banner ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              if (!window.confirm("Delete this banner?")) return;
              await deleteBannerAction(banner.id);
              router.refresh();
            }}
          >
            <Trash2 className="h-4 w-4" aria-hidden /> Delete
          </Button>
        ) : null}
        <Button type="submit" size="sm" variant="dark" loading={pending}>
          {banner ? "Save banner" : "Add banner"}
        </Button>
      </div>
    </form>
  );
}

/* ------------------------------- Content ------------------------------- */

export function ContentForm({ content }: { content: SiteContent }) {
  const { pending, status, errors, run } = useSave();
  const [c, setC] = useState(content);
  const set = (k: keyof SiteContent) => (e: { target: { value: string } }) => setC((x) => ({ ...x, [k]: e.target.value }));
  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        run(() => saveContentAction(c));
      }}
      className="space-y-6"
    >
      <Card title="Homepage hero">
        <div className="grid gap-4">
          <TextField label="Eyebrow" value={c.heroEyebrow} onChange={set("heroEyebrow")} />
          <TextField label="Headline" value={c.heroTitle} onChange={set("heroTitle")} error={errors.heroTitle} />
          <TextareaField label="Supporting text" rows={3} value={c.heroBody} onChange={set("heroBody")} />
        </div>
      </Card>
      <Card title="Section copy">
        <div className="grid gap-4">
          <TextareaField label="Contractor program pitch" rows={3} value={c.contractorPitch} onChange={set("contractorPitch")} hint="Homepage contractor band and /contractors page" />
          <TextareaField label="Free quote pitch" rows={3} value={c.quotePitch} onChange={set("quotePitch")} />
        </div>
      </Card>
      <Card title="About us">
        <div className="grid gap-4">
          <TextField label="Title" value={c.aboutTitle} onChange={set("aboutTitle")} />
          <TextareaField label="Body" rows={5} value={c.aboutBody} onChange={set("aboutBody")} hint="Placeholder — final copy to be supplied by the client." />
        </div>
      </Card>
      <SaveBar pending={pending} status={status} />
    </form>
  );
}

/* ------------------------------ Email settings ------------------------------ */

export function EmailSettingsForm({ templates, adminEmail, labels }: { templates: Record<EmailTemplate, boolean>; adminEmail: string; labels: Record<EmailTemplate, { label: string; audience: string }> }) {
  const { pending, status, errors, run } = useSave();
  const [t, setT] = useState(templates);
  const [email, setEmail] = useState(adminEmail);
  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        run(() => saveEmailSettingsAction({ templates: t, adminNotificationEmail: email }));
      }}
    >
      <Card title="Notification settings">
        <TextField label="Admin notification email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.adminNotificationEmail} containerClassName="max-w-md" hint="New orders, quotes, applications and messages are sent here." />
        <ul className="mt-6 grid gap-2 md:grid-cols-2">
          {(Object.keys(t) as EmailTemplate[]).map((key) => (
            <li key={key} className="rounded-md border border-line p-3">
              <Checkbox label={labels[key].label} description={`To: ${labels[key].audience}`} checked={t[key]} onChange={(e) => setT({ ...t, [key]: e.target.checked })} />
            </li>
          ))}
        </ul>
      </Card>
      <SaveBar pending={pending} status={status} />
    </form>
  );
}
