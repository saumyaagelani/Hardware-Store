"use client";

import { useMemo, useState } from "react";
import { Calculator, Plus, Trash2 } from "lucide-react";
import { calculateCoverage, roomsArea, WASTE_OPTIONS, type RoomInput } from "@/lib/calculator";
import type { CoverageInfo } from "@/lib/types";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/cn";

type Mode = "rooms" | "area";

/**
 * Reusable square-footage calculator. Converts room dimensions (or a known
 * area) plus a waste allowance into whole selling units (boxes / panels).
 */
export function CoverageCalculator({
  coverage,
  unitPrice,
  onApply,
}: {
  coverage: CoverageInfo;
  unitPrice: number | null;
  onApply?: (units: number) => void;
}) {
  const [mode, setMode] = useState<Mode>("rooms");
  const [measure, setMeasure] = useState<"ft" | "m">("ft");
  const [rooms, setRooms] = useState<RoomInput[]>([{ length: 12, width: 10 }]);
  const [area, setArea] = useState("");
  const [waste, setWaste] = useState(10);

  const totalArea = mode === "rooms" ? roomsArea(rooms, measure) : Number(area) || 0;
  const result = useMemo(() => calculateCoverage(totalArea, waste, coverage.perUnit), [totalArea, waste, coverage.perUnit]);
  const unitLabel = coverage.unitLabel;
  const unitPlural = unitLabel.endsWith("x") ? `${unitLabel}es` : `${unitLabel}s`;
  const plural = (n: number) => `${n} ${n === 1 ? unitLabel : unitPlural}`;

  const updateRoom = (i: number, key: keyof RoomInput, value: string) =>
    setRooms((all) => all.map((r, idx) => (idx === i ? { ...r, [key]: value === "" ? 0 : Number(value) } : r)));

  return (
    <section aria-labelledby="calc-title" className="rounded-lg border border-line bg-canvas p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <Calculator className="h-5 w-5 text-gold-dark" aria-hidden />
        <h2 id="calc-title" className="font-display text-lg font-bold text-ink">
          How much do I need?
        </h2>
      </div>
      <p className="mt-1 text-[0.8125rem] text-body">
        Each {unitLabel} covers <strong className="text-ink">{coverage.perUnit} sq. ft.</strong>
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-md border border-line bg-white p-0.5" role="group" aria-label="Measurement method">
          {(["rooms", "area"] as Mode[]).map((m) => (
            <button key={m} type="button" onClick={() => setMode(m)} aria-pressed={mode === m} className={cn("rounded px-3 py-1.5 text-xs font-semibold", mode === m ? "bg-ink text-white" : "text-body hover:text-ink")}>
              {m === "rooms" ? "Room dimensions" : "I know my sq. ft."}
            </button>
          ))}
        </div>
        {mode === "rooms" ? (
          <div className="inline-flex rounded-md border border-line bg-white p-0.5" role="group" aria-label="Units">
            {(["ft", "m"] as const).map((u) => (
              <button key={u} type="button" onClick={() => setMeasure(u)} aria-pressed={measure === u} className={cn("rounded px-2.5 py-1.5 text-xs font-semibold", measure === u ? "bg-ink text-white" : "text-body hover:text-ink")}>
                {u === "ft" ? "Feet" : "Metres"}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {mode === "rooms" ? (
        <div className="mt-4 space-y-2">
          {rooms.map((room, i) => (
            <div key={i} className="flex items-end gap-2">
              <label className="flex-1 text-xs font-medium text-body">
                {i === 0 ? `Length (${measure})` : <span className="sr-only">Length room {i + 1}</span>}
                <input type="number" min={0} step="0.1" inputMode="decimal" value={room.length || ""} onChange={(e) => updateRoom(i, "length", e.target.value)} className="field-input mt-1 min-h-10! py-2!" aria-label={`Room ${i + 1} length in ${measure}`} />
              </label>
              <span className="pb-2.5 text-body" aria-hidden>
                ×
              </span>
              <label className="flex-1 text-xs font-medium text-body">
                {i === 0 ? `Width (${measure})` : <span className="sr-only">Width room {i + 1}</span>}
                <input type="number" min={0} step="0.1" inputMode="decimal" value={room.width || ""} onChange={(e) => updateRoom(i, "width", e.target.value)} className="field-input mt-1 min-h-10! py-2!" aria-label={`Room ${i + 1} width in ${measure}`} />
              </label>
              <button type="button" onClick={() => setRooms((all) => all.filter((_, idx) => idx !== i))} disabled={rooms.length === 1} className="mb-0.5 flex h-10 w-10 items-center justify-center rounded-md text-body hover:bg-white hover:text-danger disabled:opacity-30" aria-label={`Remove room ${i + 1}`}>
                <Trash2 className="h-4 w-4" aria-hidden />
              </button>
            </div>
          ))}
          {rooms.length < 8 ? (
            <button type="button" onClick={() => setRooms((all) => [...all, { length: 0, width: 0 }])} className="inline-flex items-center gap-1 text-sm font-semibold text-ink hover:text-gold-dark">
              <Plus className="h-4 w-4" aria-hidden /> Add another area
            </button>
          ) : null}
        </div>
      ) : (
        <label className="mt-4 block text-xs font-medium text-body">
          Total area (sq. ft.)
          <input type="number" min={0} inputMode="decimal" value={area} onChange={(e) => setArea(e.target.value)} placeholder="e.g. 450" className="field-input mt-1" />
        </label>
      )}

      <fieldset className="mt-4">
        <legend className="text-xs font-medium text-body">Waste allowance</legend>
        <div className="mt-1.5 grid grid-cols-4 gap-1.5">
          {WASTE_OPTIONS.map((w) => (
            <button key={w} type="button" onClick={() => setWaste(w)} aria-pressed={waste === w} className={cn("rounded-md border py-2 text-sm font-semibold", waste === w ? "border-ink bg-ink text-white" : "border-line bg-white text-ink hover:border-ink")}>
              {w === 0 ? "None" : `${w}%`}
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-xs text-body">10% is typical for straight lay; choose 15% for diagonal, herringbone or rooms with many cuts.</p>
      </fieldset>

      <div className="mt-4 rounded-md bg-white p-4 ring-1 ring-line" aria-live="polite">
        {result.units > 0 ? (
          <>
            <dl className="grid grid-cols-2 gap-y-1.5 text-sm">
              <dt className="text-body">Area</dt>
              <dd className="text-right font-medium text-ink">{result.area.toLocaleString("en-CA")} sq. ft.</dd>
              <dt className="text-body">With {waste}% waste</dt>
              <dd className="text-right font-medium text-ink">{result.areaWithWaste.toLocaleString("en-CA")} sq. ft.</dd>
              <dt className="text-body">Coverage purchased</dt>
              <dd className="text-right font-medium text-ink">{result.coverage.toLocaleString("en-CA")} sq. ft.</dd>
            </dl>
            <div className="mt-3 flex items-end justify-between border-t border-line pt-3">
              <div>
                <p className="text-xs text-body">You need</p>
                <p className="font-display text-2xl font-extrabold text-ink">{plural(result.units)}</p>
              </div>
              {unitPrice !== null ? (
                <div className="text-right">
                  <p className="text-xs text-body">Estimated</p>
                  <p className="font-display text-xl font-bold text-ink">{formatMoney(result.units * unitPrice)}</p>
                </div>
              ) : null}
            </div>
            {onApply ? (
              <button type="button" onClick={() => onApply(result.units)} className="mt-3 h-10 w-full rounded-md bg-gold text-sm font-semibold text-ink hover:bg-gold-dark">
                Use {plural(result.units)}
              </button>
            ) : null}
          </>
        ) : (
          <p className="text-sm text-body">Enter your measurements to calculate how many {unitPlural} you need.</p>
        )}
      </div>
    </section>
  );
}
