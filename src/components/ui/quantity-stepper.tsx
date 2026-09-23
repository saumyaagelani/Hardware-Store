"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/cn";

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 999,
  size = "md",
  label = "Quantity",
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
  label?: string;
}) {
  const clamp = (n: number) => Math.max(min, Math.min(max, Number.isFinite(n) ? Math.floor(n) : min));
  const h = size === "sm" ? "h-9" : "h-11";
  return (
    <div className={cn("inline-flex items-stretch overflow-hidden rounded-md border border-line bg-white", h)} role="group" aria-label={label}>
      <button type="button" className="flex w-9 items-center justify-center text-ink hover:bg-mist disabled:opacity-40" onClick={() => onChange(clamp(value - 1))} disabled={value <= min} aria-label={`Decrease ${label.toLowerCase()}`}>
        <Minus className="h-4 w-4" aria-hidden />
      </button>
      <input
        type="number"
        inputMode="numeric"
        className="w-12 border-x border-line text-center text-sm font-semibold text-ink [appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none"
        value={value}
        min={min}
        max={max}
        aria-label={label}
        onChange={(e) => onChange(clamp(Number(e.target.value)))}
      />
      <button type="button" className="flex w-9 items-center justify-center text-ink hover:bg-mist disabled:opacity-40" onClick={() => onChange(clamp(value + 1))} disabled={value >= max} aria-label={`Increase ${label.toLowerCase()}`}>
        <Plus className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}
