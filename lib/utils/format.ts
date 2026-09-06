const dateFmt = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

const dateTimeFmt = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : dateFmt.format(d);
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : dateTimeFmt.format(d);
}

/** Compact relative time, e.g. "3d ago", "in 2h". */
export function formatRelative(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value).getTime();
  if (Number.isNaN(d)) return "—";
  const diffMs = d - Date.now();
  const abs = Math.abs(diffMs);
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["day", 86400000],
    ["hour", 3600000],
    ["minute", 60000],
  ];
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  for (const [unit, ms] of units) {
    if (abs >= ms || unit === "minute") {
      return rtf.format(Math.round(diffMs / ms), unit);
    }
  }
  return "just now";
}

export function formatMoney(
  value: string | number | null | undefined,
): string | null {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(n)) return null;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function fullName(p: {
  first_name: string;
  middle_initial?: string | null;
  last_name: string;
}): string {
  return [p.first_name, p.middle_initial, p.last_name]
    .filter(Boolean)
    .join(" ");
}

/** "min – max" / "min" / "max" / null for a salary range. */
export function salaryLabel(range: {
  salary_min: string | number | null;
  salary_max: string | number | null;
}): string | null {
  const min = formatMoney(range.salary_min);
  const max = formatMoney(range.salary_max);
  if (min && max) return `${min} – ${max}`;
  return min ?? max ?? null;
}
