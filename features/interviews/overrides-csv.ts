/** Parse a pasted / uploaded date-overrides CSV into `DateOverrideInput` rows.
 *
 * Expected header (order-independent, case-insensitive):
 *   start_date, end_date, type, start, end, note
 *
 * - `start_date` required, `YYYY-MM-DD`
 * - `end_date` optional — blank means a single day
 * - `type` — `blocked` (default) or `hours`
 * - `start` / `end` — `HH:MM`, required when `type` is `hours`
 * - `note` optional
 *
 * Bad rows are reported, not fatal: valid rows still come back. */

import type { DateOverrideInput } from "@/features/interviews/schema";

export const CSV_TEMPLATE =
  "start_date,end_date,type,start,end,note\n" +
  "2026-12-25,,blocked,,,Christmas Day\n" +
  "2026-12-29,2027-01-02,blocked,,,Holiday break\n" +
  "2026-11-14,,hours,09:00,12:00,Short Friday\n";

export interface CsvParseResult {
  rows: DateOverrideInput[];
  errors: string[];
}

/** Minimal RFC-4180 parser (quoted fields, embedded commas / newlines). */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  const src = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += c;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

export function parseOverridesCsv(text: string): CsvParseResult {
  const table = parseCsv(text);
  if (table.length === 0) return { rows: [], errors: ["The file is empty."] };

  const header = table[0].map((h) => h.trim().toLowerCase());
  const col = (name: string) => header.indexOf(name);
  const iStart = col("start_date");
  if (iStart === -1)
    return {
      rows: [],
      errors: ['Missing a "start_date" column in the header row.'],
    };
  const iEnd = col("end_date");
  const iType = col("type");
  const iFrom = col("start");
  const iTo = col("end");
  const iNote = col("note");

  const rows: DateOverrideInput[] = [];
  const errors: string[] = [];
  const at = (r: string[], i: number) => (i === -1 ? "" : (r[i] ?? "").trim());

  table.slice(1).forEach((r, idx) => {
    const line = idx + 2; // 1-based, +1 for header
    const startDate = at(r, iStart);
    const endDate = at(r, iEnd);
    const type = at(r, iType).toLowerCase() || "blocked";
    const from = at(r, iFrom);
    const to = at(r, iTo);
    const note = at(r, iNote);

    if (!DATE_RE.test(startDate)) {
      errors.push(`Row ${line}: "${startDate}" is not a YYYY-MM-DD date.`);
      return;
    }
    if (endDate && !DATE_RE.test(endDate)) {
      errors.push(`Row ${line}: end_date "${endDate}" is not a YYYY-MM-DD date.`);
      return;
    }
    if (endDate && endDate < startDate) {
      errors.push(`Row ${line}: end_date is before start_date.`);
      return;
    }
    if (type !== "blocked" && type !== "hours") {
      errors.push(`Row ${line}: type must be "blocked" or "hours".`);
      return;
    }
    if (type === "hours") {
      if (!TIME_RE.test(from) || !TIME_RE.test(to)) {
        errors.push(`Row ${line}: custom hours need start and end as HH:MM.`);
        return;
      }
      if (to <= from) {
        errors.push(`Row ${line}: end time must be after start time.`);
        return;
      }
    }

    rows.push({
      start_date: startDate,
      end_date: endDate || startDate,
      is_unavailable: type === "blocked",
      start: type === "hours" ? from : null,
      end: type === "hours" ? to : null,
      note: note || null,
    });
  });

  return { rows, errors };
}
