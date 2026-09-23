import type { Counters } from "./types";

/** Format a quote reference, e.g. Q-2026-0001. */
export function formatQuoteReference(year: number, sequence: number): string {
  return `Q-${year}-${String(sequence).padStart(4, "0")}`;
}

/**
 * Allocate the next quote reference. Sequences restart each calendar year.
 * Returns the reference and the updated counters (the input is not mutated).
 */
export function nextQuoteReference(counters: Counters, date = new Date()): { reference: string; counters: Counters } {
  const year = date.getFullYear();
  const next = (counters.quoteByYear[String(year)] ?? 0) + 1;
  return {
    reference: formatQuoteReference(year, next),
    counters: { ...counters, quoteByYear: { ...counters.quoteByYear, [String(year)]: next } },
  };
}

export function nextOrderNumber(counters: Counters): { number: string; counters: Counters } {
  const next = counters.order + 1;
  return { number: `NL-${next}`, counters: { ...counters, order: next } };
}
