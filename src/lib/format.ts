const money = new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" });

export function formatMoney(amount: number): string {
  return money.format(amount).replace("CA", "");
}

export function formatDate(iso: string | undefined, opts: Intl.DateTimeFormatOptions = { dateStyle: "medium" }): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-CA", { ...opts, timeZone: "America/Toronto" });
}

export function formatDateTime(iso: string | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-CA", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Toronto",
  });
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

const STORE_TZ = "America/Toronto";

/** ISO timestamp → "YYYY-MM-DD" in the store's time zone (for <input type="date">). */
export function toDateInput(iso: string | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-CA", { timeZone: STORE_TZ });
}

/** "YYYY-MM-DD" → noon UTC, which is the same calendar day in every Canadian time zone. */
export function dateInputToISO(date: string): string {
  return new Date(`${date}T12:00:00.000Z`).toISOString();
}

/** "YYYY-MM-DD" → the last millisecond of that day in the store's time zone (e.g. sale end). */
export function dateInputToEndOfDayISO(date: string): string {
  const noonUtc = new Date(`${date}T12:00:00.000Z`);
  const localHour = Number(new Intl.DateTimeFormat("en-US", { timeZone: STORE_TZ, hour: "numeric", hourCycle: "h23" }).format(noonUtc));
  const offsetHours = 12 - localHour;
  return new Date(Date.parse(`${date}T23:59:59.999Z`) + offsetHours * 3600000).toISOString();
}

/** Today's date as "YYYY-MM-DD" in the browser's local time zone, offset by `days`. */
export function localDateInput(days = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
