"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

/** GET-style search + select filters for admin lists (keeps other params). */
export function ListSearch({ placeholder, selects = [] }: { placeholder: string; selects?: { name: string; label: string; options: { value: string; label: string }[] }[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const push = (mut: (p: URLSearchParams) => void) => {
    const next = new URLSearchParams(params.toString());
    mut(next);
    router.push(`${pathname}?${next.toString()}`);
  };
  return (
    <form
      className="mb-4 flex flex-col gap-2 sm:flex-row"
      onSubmit={(e) => {
        e.preventDefault();
        push((p) => (q ? p.set("q", q) : p.delete("q")));
      }}
    >
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} aria-label={placeholder} className="field-input min-h-10! pl-9!" type="search" />
      </div>
      {selects.map((s) => (
        <select
          key={s.name}
          aria-label={s.label}
          value={params.get(s.name) ?? ""}
          onChange={(e) => push((p) => (e.target.value ? p.set(s.name, e.target.value) : p.delete(s.name)))}
          className="field-input min-h-10! py-2! sm:w-48"
        >
          <option value="">{s.label}: All</option>
          {s.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ))}
      <button type="submit" className="h-10 rounded-md bg-ink px-4 text-sm font-semibold text-white hover:bg-ink-soft">
        Search
      </button>
    </form>
  );
}
