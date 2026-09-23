"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Search } from "lucide-react";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";

export function HeaderSearch({ className, id = "site-search" }: { className?: string; id?: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");

  function submit(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    track("search", { search_term: q });
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/shop");
  }

  return (
    <form role="search" onSubmit={submit} className={cn("relative flex w-full", className)}>
      <label htmlFor={id} className="sr-only">
        Search products
      </label>
      <input
        id={id}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search vinyl, doors, vanities, SKU…"
        autoComplete="off"
        className="h-11 w-full rounded-l-md border border-r-0 border-line bg-canvas pr-3 pl-4 text-[0.9375rem] text-ink placeholder:text-muted focus:border-ink focus:bg-white focus:outline-none"
      />
      <button type="submit" className="flex h-11 shrink-0 items-center gap-2 rounded-r-md bg-ink px-4 text-sm font-semibold text-white hover:bg-ink-soft" aria-label="Search">
        <Search className="h-4.5 w-4.5" aria-hidden />
        <span className="hidden xl:inline">Search</span>
      </button>
    </form>
  );
}
