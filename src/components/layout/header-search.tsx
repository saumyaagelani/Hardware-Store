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
    <form role="search" onSubmit={submit} className={cn("relative flex h-12 w-full items-center gap-3 rounded-md border border-ink-line bg-white/[0.04] pr-2 pl-4 transition-colors focus-within:border-muted lg:h-14", className)}>
      <Search className="h-5 w-5 shrink-0 text-muted" aria-hidden />
      <label htmlFor={id} className="sr-only">
        Search products
      </label>
      <input
        id={id}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search flooring, doors, vanities & more"
        autoComplete="off"
        className="h-full w-full min-w-0 bg-transparent text-[0.9375rem] text-white placeholder:text-muted focus:outline-none [&::-webkit-search-cancel-button]:invert"
      />
      <button type="submit" className="shrink-0 rounded-sm border border-ink-line px-2.5 py-1 text-xs font-medium text-muted transition-colors hover:border-gold hover:text-gold" aria-label="Search">
        Search
      </button>
    </form>
  );
}
