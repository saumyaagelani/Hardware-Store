"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Check, Loader2 } from "lucide-react";
import type { Product } from "@/lib/types";
import { quickUpdateInventoryAction, quickUpdatePricingAction } from "@/app/actions/admin";
import { statusFromQuantity, stockStatusOptions } from "@/lib/stock";
import { cn } from "@/lib/cn";

function SaveButton({ pending, saved, dirty, onClick }: { pending: boolean; saved: boolean; dirty: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!dirty || pending}
      className={cn("inline-flex h-9 min-w-16 items-center justify-center gap-1 rounded-md px-3 text-xs font-semibold", dirty ? "bg-ink text-white hover:bg-ink-soft" : saved ? "text-success" : "text-muted")}
    >
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : saved && !dirty ? <Check className="h-3.5 w-3.5" aria-hidden /> : null}
      {saved && !dirty ? "Saved" : "Save"}
    </button>
  );
}

export function InventoryRow({ product }: { product: Pick<Product, "id" | "inventory" | "name"> }) {
  const router = useRouter();
  const [status, setStatus] = useState(product.inventory.status);
  const [qty, setQty] = useState(String(product.inventory.quantity));
  const [restock, setRestock] = useState(product.inventory.restockDate?.slice(0, 10) ?? "");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const dirty = status !== product.inventory.status || Number(qty) !== product.inventory.quantity || restock !== (product.inventory.restockDate?.slice(0, 10) ?? "");

  return (
    <>
      <td className="border-t border-line px-4 py-2">
        <label className="sr-only" htmlFor={`qty-${product.id}`}>Quantity for {product.name}</label>
        <input
          id={`qty-${product.id}`}
          type="number"
          min={0}
          value={qty}
          onChange={(e) => {
            setSaved(false);
            setQty(e.target.value);
            setStatus(statusFromQuantity(Number(e.target.value) || 0, product.inventory.lowStockThreshold, status));
          }}
          className="field-input min-h-9! w-24 py-1.5!"
        />
      </td>
      <td className="border-t border-line px-4 py-2">
        <label className="sr-only" htmlFor={`status-${product.id}`}>Stock status for {product.name}</label>
        <select id={`status-${product.id}`} value={status} onChange={(e) => { setSaved(false); setStatus(e.target.value as typeof status); }} className="field-input min-h-9! w-40 py-1.5!">
          {stockStatusOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </td>
      <td className="border-t border-line px-4 py-2">
        <label className="sr-only" htmlFor={`restock-${product.id}`}>Restock date for {product.name}</label>
        <input id={`restock-${product.id}`} type="date" value={restock} onChange={(e) => { setSaved(false); setRestock(e.target.value); }} className="field-input min-h-9! w-40 py-1.5!" />
      </td>
      <td className="border-t border-line px-4 py-2 text-right">
        <SaveButton
          pending={pending}
          saved={saved}
          dirty={dirty}
          onClick={() =>
            start(async () => {
              const res = await quickUpdateInventoryAction(product.id, { status, quantity: Number(qty) || 0, restockDate: restock || undefined });
              if (res.ok) {
                setSaved(true);
                setError(null);
                router.refresh();
              } else setError(res.error ?? "Save failed");
            })
          }
        />
        {error ? <p className="mt-1 text-xs text-danger">{error}</p> : null}
      </td>
    </>
  );
}

const toStr = (n: number | null) => (n === null ? "" : String(n));
const toNum = (s: string) => (s.trim() === "" ? null : Number(s));

export function PricingRow({ product }: { product: Pick<Product, "id" | "pricing" | "name"> }) {
  const router = useRouter();
  const [retail, setRetail] = useState(toStr(product.pricing.retail));
  const [sale, setSale] = useState(toStr(product.pricing.sale));
  const [contractor, setContractor] = useState(toStr(product.pricing.contractor));
  const [visibility, setVisibility] = useState(product.pricing.visibility);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const dirty = toNum(retail) !== product.pricing.retail || toNum(sale) !== product.pricing.sale || toNum(contractor) !== product.pricing.contractor || visibility !== product.pricing.visibility;
  const input = (label: string, value: string, set: (v: string) => void) => (
    <td className="border-t border-line px-3 py-2">
      <label className="sr-only" htmlFor={`${label}-${product.id}`}>{label} price for {product.name}</label>
      <div className="relative">
        <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-xs text-muted">$</span>
        <input id={`${label}-${product.id}`} type="number" min={0} step="0.01" value={value} placeholder="—" onChange={(e) => { setSaved(false); set(e.target.value); }} className="field-input min-h-9! w-28 py-1.5! pl-6!" />
      </div>
    </td>
  );
  return (
    <>
      {input("Retail", retail, setRetail)}
      {input("Sale", sale, setSale)}
      {input("Contractor", contractor, setContractor)}
      <td className="border-t border-line px-3 py-2">
        <label className="sr-only" htmlFor={`vis-${product.id}`}>Price visibility for {product.name}</label>
        <select id={`vis-${product.id}`} value={visibility} onChange={(e) => { setSaved(false); setVisibility(e.target.value as typeof visibility); }} className="field-input min-h-9! w-44 py-1.5!">
          <option value="public">Public</option>
          <option value="contractors_only">Contractors only</option>
          <option value="hidden">Hidden (quote)</option>
        </select>
      </td>
      <td className="border-t border-line px-3 py-2 text-right">
        <SaveButton
          pending={pending}
          saved={saved}
          dirty={dirty}
          onClick={() =>
            start(async () => {
              const res = await quickUpdatePricingAction(product.id, { retail: toNum(retail), sale: toNum(sale), contractor: toNum(contractor), visibility });
              if (res.ok) {
                setSaved(true);
                setError(null);
                router.refresh();
              } else setError(res.error ?? "Save failed");
            })
          }
        />
        {error ? <p className="mt-1 max-w-40 text-xs text-danger">{error}</p> : null}
      </td>
    </>
  );
}
