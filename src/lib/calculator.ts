export type WasteAllowance = 0 | 5 | 10 | 15;
export const WASTE_OPTIONS: WasteAllowance[] = [0, 5, 10, 15];

export interface RoomInput {
  length: number;
  width: number;
}

export interface CoverageResult {
  area: number;
  areaWithWaste: number;
  units: number;
  coverage: number;
  overage: number;
}

const SQFT_PER_SQM = 10.7639;

/** Area of a set of rectangular rooms in square feet. Invalid rooms are ignored. */
export function roomsArea(rooms: RoomInput[], measure: "ft" | "m" = "ft"): number {
  const total = rooms.reduce((sum, r) => {
    const l = Number(r.length);
    const w = Number(r.width);
    if (!Number.isFinite(l) || !Number.isFinite(w) || l <= 0 || w <= 0) return sum;
    return sum + l * w;
  }, 0);
  return measure === "m" ? total * SQFT_PER_SQM : total;
}

/**
 * How many selling units (e.g. boxes) are needed to cover an area, including a
 * waste allowance for cuts and pattern matching. Always rounds up to whole units.
 */
export function calculateCoverage(areaSqft: number, wastePercent: number, coveragePerUnit: number): CoverageResult {
  if (!Number.isFinite(areaSqft) || areaSqft <= 0 || !Number.isFinite(coveragePerUnit) || coveragePerUnit <= 0) {
    return { area: 0, areaWithWaste: 0, units: 0, coverage: 0, overage: 0 };
  }
  const waste = Math.max(0, wastePercent);
  const areaWithWaste = round2(areaSqft * (1 + waste / 100));
  // Small epsilon avoids floating point pushing an exact fit up an extra unit.
  const units = Math.ceil(areaWithWaste / coveragePerUnit - 1e-9);
  const coverage = round2(units * coveragePerUnit);
  return { area: round2(areaSqft), areaWithWaste, units, coverage, overage: round2(coverage - areaSqft) };
}

const round2 = (n: number) => Math.round(n * 100) / 100;
