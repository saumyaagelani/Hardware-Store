"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import type { Facets } from "@/lib/catalog-filter";
import { Dialog } from "@/components/ui/dialog";
import { cn } from "@/lib/cn";

interface Props {
  facets: Facets;
  showCategories: boolean;
  total: number;
}

function useFilterNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const urlParams = useSearchParams();
  const [pending, start] = useTransition();
  // Optimistic copy of the query so controls react instantly while the new
  // results load. Components are re-keyed on URL change, which resets this.
  const [params, setParams] = useState(() => new URLSearchParams(urlParams.toString()));

  const update = (mutator: (p: URLSearchParams) => void) => {
    const next = new URLSearchParams(params.toString());
    mutator(next);
    setParams(next);
    const qs = next.toString();
    start(() => router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  };

  const toggleList = (key: string, value: string) =>
    update((p) => {
      const values = (p.get(key) ?? "").split(",").filter(Boolean);
      const nextValues = values.includes(value) ? values.filter((v) => v !== value) : [...values, value];
      if (nextValues.length) p.set(key, nextValues.join(","));
      else p.delete(key);
    });

  const setValue = (key: string, value: string | null) =>
    update((p) => {
      if (value) p.set(key, value);
      else p.delete(key);
    });

  const listHas = (key: string, value: string) => (params.get(key) ?? "").split(",").includes(value);

  return { params, pending, update, toggleList, setValue, listHas };
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="border-b border-line py-5 first:pt-0">
      <legend className="mb-3 font-display text-sm font-bold tracking-[0.1em] text-ink uppercase">{title}</legend>
      <div className="space-y-2.5">{children}</div>
    </fieldset>
  );
}

function CheckRow({ label, count, checked, onChange }: { label: string; count?: number; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink">
      <input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 accent-ink" />
      <span className="flex-1">{label}</span>
      {count !== undefined ? <span className="text-xs text-muted">{count}</span> : null}
    </label>
  );
}

function FilterFields({ facets, showCategories }: Omit<Props, "total">) {
  const { params, toggleList, setValue, listHas, update } = useFilterNavigation();
  const [min, setMin] = useState(params.get("min") ?? "");
  const [max, setMax] = useState(params.get("max") ?? "");

  return (
    <div>
      {showCategories && facets.categories.length ? (
        <Group title="Category">
          {facets.categories.map((c) => (
            <label key={c.value} className="flex cursor-pointer items-center gap-2.5 text-sm text-ink">
              <input type="radio" name="category" checked={params.get("category") === c.value} onChange={() => setValue("category", c.value)} className="h-4 w-4 accent-ink" />
              <span className="flex-1">{c.label}</span>
              <span className="text-xs text-muted">{c.count}</span>
            </label>
          ))}
          {params.get("category") ? (
            <button type="button" className="text-xs font-semibold text-body underline" onClick={() => setValue("category", null)}>
              All categories
            </button>
          ) : null}
        </Group>
      ) : null}

      {showCategories && facets.subcategories.length ? (
        <Group title="Type">
          {facets.subcategories.map((s) => (
            <label key={s.value} className="flex cursor-pointer items-center gap-2.5 text-sm text-ink">
              <input type="radio" name="sub" checked={params.get("sub") === s.value} onChange={() => setValue("sub", s.value)} className="h-4 w-4 accent-ink" />
              <span className="flex-1">{s.label}</span>
              <span className="text-xs text-muted">{s.count}</span>
            </label>
          ))}
          {params.get("sub") ? (
            <button type="button" className="text-xs font-semibold text-body underline" onClick={() => setValue("sub", null)}>
              All types
            </button>
          ) : null}
        </Group>
      ) : null}

      <Group title="Availability">
        <CheckRow label="In stock" count={facets.inStock} checked={listHas("availability", "in_stock")} onChange={() => toggleList("availability", "in_stock")} />
        <CheckRow label="Special order" count={facets.specialOrder} checked={listHas("availability", "special_order")} onChange={() => toggleList("availability", "special_order")} />
      </Group>

      <Group title="Deals">
        <CheckRow label="On sale" count={facets.onSale} checked={params.get("sale") === "1"} onChange={() => setValue("sale", params.get("sale") === "1" ? null : "1")} />
      </Group>

      <Group title="Price">
        <form
          className="flex items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            update((p) => {
              if (min) p.set("min", min);
              else p.delete("min");
              if (max) p.set("max", max);
              else p.delete("max");
            });
          }}
        >
          <label className="flex-1 text-xs text-body">
            Min $
            <input type="number" min={0} inputMode="numeric" value={min} onChange={(e) => setMin(e.target.value)} className="field-input mt-1 min-h-9! py-1.5!" />
          </label>
          <label className="flex-1 text-xs text-body">
            Max $
            <input type="number" min={0} inputMode="numeric" value={max} onChange={(e) => setMax(e.target.value)} className="field-input mt-1 min-h-9! py-1.5!" />
          </label>
          <button type="submit" className="h-9 rounded-md bg-ink px-3 text-sm font-semibold text-white hover:bg-ink-soft">
            Go
          </button>
        </form>
      </Group>

      {facets.brands.length > 1 ? (
        <Group title="Brand">
          {facets.brands.map((b) => (
            <CheckRow key={b.value} label={b.value} count={b.count} checked={listHas("brand", b.value)} onChange={() => toggleList("brand", b.value)} />
          ))}
        </Group>
      ) : null}
    </div>
  );
}

export function FilterSidebar(props: Omit<Props, "total">) {
  const params = useSearchParams();
  return (
    <aside aria-label="Filters" className="hidden lg:block">
      <FilterFields key={params.toString()} {...props} />
    </aside>
  );
}

export function MobileFilters({ facets, showCategories, total }: Props) {
  const [open, setOpen] = useState(false);
  const params = useSearchParams();
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="inline-flex h-10 items-center gap-2 rounded-md border border-line bg-white px-3.5 text-sm font-semibold text-ink hover:border-ink lg:hidden">
        <SlidersHorizontal className="h-4 w-4" aria-hidden /> Filters
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Filter products" variant="drawer" side="left">
        <div className="p-5">
          <FilterFields key={params.toString()} facets={facets} showCategories={showCategories} />
        </div>
        <div className="sticky bottom-0 border-t border-line bg-white p-4">
          <button type="button" onClick={() => setOpen(false)} className="h-11 w-full rounded-md bg-ink font-semibold text-white">
            Show {total} result{total === 1 ? "" : "s"}
          </button>
        </div>
      </Dialog>
    </>
  );
}

export function SortSelect({ options }: { options: { value: string; label: string }[] }) {
  const urlParams = useSearchParams();
  return <SortSelectInner key={urlParams.toString()} options={options} />;
}

function SortSelectInner({ options }: { options: { value: string; label: string }[] }) {
  const { params, setValue, pending } = useFilterNavigation();
  return (
    <label className="flex items-center gap-2 text-sm text-body">
      <span className="hidden sm:inline">Sort by</span>
      <select
        value={params.get("sort") ?? ""}
        onChange={(e) => setValue("sort", e.target.value || null)}
        className={cn("field-input h-10 min-h-10! w-auto py-0! text-sm", pending && "opacity-60")}
        aria-label="Sort products"
      >
        <option value="">{params.get("q") ? "Best match" : "Featured"}</option>
        {options.filter((o) => o.value !== "featured").map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export interface ActiveChip {
  key: string;
  value?: string;
  label: string;
}

export function ActiveFilters({ chips }: { chips: ActiveChip[] }) {
  const urlParams = useSearchParams();
  return <ActiveFiltersInner key={urlParams.toString()} chips={chips} />;
}

function ActiveFiltersInner({ chips }: { chips: ActiveChip[] }) {
  const { update } = useFilterNavigation();
  if (!chips.length) return null;
  return (
    <div className="mb-5 flex flex-wrap items-center gap-2">
      {chips.map((c) => (
        <button
          key={`${c.key}-${c.value ?? ""}`}
          type="button"
          onClick={() =>
            update((p) => {
              if (c.value) {
                const rest = (p.get(c.key) ?? "").split(",").filter((v) => v && v !== c.value);
                if (rest.length) p.set(c.key, rest.join(","));
                else p.delete(c.key);
              } else p.delete(c.key);
            })
          }
          className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white py-1 pr-2 pl-3 text-[0.8125rem] font-medium text-ink hover:border-ink"
        >
          {c.label} <X className="h-3.5 w-3.5" aria-label={`Remove ${c.label} filter`} />
        </button>
      ))}
      <button
        type="button"
        onClick={() =>
          update((p) => {
            for (const k of ["brand", "availability", "sale", "min", "max", "sub", "category"]) p.delete(k);
          })
        }
        className="text-[0.8125rem] font-semibold text-body underline underline-offset-2 hover:text-ink"
      >
        Clear all
      </button>
    </div>
  );
}
