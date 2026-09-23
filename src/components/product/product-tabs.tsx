"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export function ProductTabs({ tabs }: { tabs: { id: string; label: string; content: ReactNode }[] }) {
  const [active, setActive] = useState(tabs[0]?.id);
  return (
    <div>
      <div role="tablist" aria-label="Product information" className="scrollbar-none -mx-4 flex gap-1 overflow-x-auto border-b border-line px-4 sm:mx-0 sm:px-0">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={active === t.id}
            aria-controls={`panel-${t.id}`}
            onClick={() => setActive(t.id)}
            onKeyDown={(e) => {
              const i = tabs.findIndex((x) => x.id === t.id);
              if (e.key === "ArrowRight") setActive(tabs[(i + 1) % tabs.length].id);
              if (e.key === "ArrowLeft") setActive(tabs[(i - 1 + tabs.length) % tabs.length].id);
            }}
            className={cn(
              "-mb-px shrink-0 border-b-2 px-4 py-3 font-display text-[0.9375rem] font-bold whitespace-nowrap transition-colors",
              active === t.id ? "border-gold text-ink" : "border-transparent text-body hover:text-ink",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map((t) => (
        <div key={t.id} role="tabpanel" id={`panel-${t.id}`} aria-labelledby={`tab-${t.id}`} hidden={active !== t.id} className="py-6">
          {t.content}
        </div>
      ))}
    </div>
  );
}
