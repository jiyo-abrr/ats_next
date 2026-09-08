import { z } from "zod";

import type { QuestionType } from "@/lib/types";

export type TemplateKind =
  | "pre-assessment"
  | "culture-fit"
  | "technical-assessment";

export const TEMPLATE_KINDS: TemplateKind[] = [
  "pre-assessment",
  "culture-fit",
  "technical-assessment",
];

export const TEMPLATE_KIND_LABELS: Record<TemplateKind, string> = {
  "pre-assessment": "Pre-assessment",
  "culture-fit": "Culture fit",
  "technical-assessment": "Technical",
};

export interface TemplateQuestion {
  id: string;
  order_index: number;
  prompt: string;
  question_type: QuestionType;
  config: Record<string, unknown> | null;
  time_limit_seconds: number | null;
}

export interface AssessmentTemplate {
  id: string;
  title: string;
  description: string | null;
  instructions: string | null;
  time_limit_minutes: number | null;
  questions: TemplateQuestion[];
  created_at: string;
  updated_at: string;
}

// ---- Forms ----

const optionalNumeric = z
  .string()
  .trim()
  .optional()
  .refine((v) => !v || Number(v) > 0, "Must be a positive number");

export const templateSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().trim().max(2000).optional(),
  instructions: z.string().trim().max(4000).optional(),
  time_limit_minutes: optionalNumeric,
});
export type TemplateInput = z.infer<typeof templateSchema>;

export const QUESTION_TYPES: QuestionType[] = [
  "text",
  "long_text",
  "single_choice",
  "multiple_choice",
  "boolean",
  "number",
  "rating",
  "date",
];

const optionalInt = z
  .string()
  .trim()
  .optional()
  .refine(
    (v) => !v || (Number.isInteger(Number(v)) && Number(v) >= 0),
    "Must be a whole number ≥ 0",
  );

export const questionSchema = z.object({
  prompt: z.string().trim().min(1, "Prompt is required").max(2000),
  question_type: z.enum([
    "text",
    "long_text",
    "single_choice",
    "multiple_choice",
    "boolean",
    "number",
    "rating",
    "date",
  ]),
  /** newline-separated — only used for choice types */
  options: z.string().optional(),
  /** number / rating bounds */
  min: z.string().trim().optional(),
  max: z.string().trim().optional(),
  /** text / long_text character cap */
  max_length: optionalInt,
  /** multiple_choice selection-count bounds */
  min_selections: optionalInt,
  max_selections: optionalInt,
  /** date bounds (ISO yyyy-mm-dd) */
  min_date: z.string().trim().optional(),
  max_date: z.string().trim().optional(),
  time_limit_seconds: optionalNumeric,
});
export type QuestionInput = z.infer<typeof questionSchema>;

/** Build the API `config` object from the flat form values, per question type. */
export function buildQuestionConfig(
  v: QuestionInput,
): Record<string, unknown> | null {
  const cfg: Record<string, unknown> = {};
  const t = v.question_type;

  if (t === "single_choice" || t === "multiple_choice") {
    cfg.options = (v.options ?? "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (t === "multiple_choice") {
    if (v.min_selections) cfg.min_selections = Number(v.min_selections);
    if (v.max_selections) cfg.max_selections = Number(v.max_selections);
  }
  if (t === "number" || t === "rating") {
    if (v.min) cfg.min = Number(v.min);
    if (v.max) cfg.max = Number(v.max);
  }
  if (t === "text" || t === "long_text") {
    if (v.max_length) cfg.max_length = Number(v.max_length);
  }
  if (t === "date") {
    if (v.min_date) cfg.min_date = v.min_date;
    if (v.max_date) cfg.max_date = v.max_date;
  }
  return Object.keys(cfg).length ? cfg : null;
}

const asText = (x: unknown) =>
  x === undefined || x === null ? "" : String(x);

/** Flatten a saved question back into the flat form shape (for editing). */
export function questionFormValues(q?: TemplateQuestion): QuestionInput {
  const c = q?.config ?? {};
  const opts = Array.isArray(c.options) ? (c.options as string[]) : [];
  return {
    prompt: q?.prompt ?? "",
    question_type: q?.question_type ?? "text",
    options: opts.join("\n"),
    min: asText(c.min),
    max: asText(c.max),
    max_length: asText(c.max_length),
    min_selections: asText(c.min_selections),
    max_selections: asText(c.max_selections),
    min_date: asText(c.min_date),
    max_date: asText(c.max_date),
    time_limit_seconds: q?.time_limit_seconds
      ? String(q.time_limit_seconds)
      : "",
  };
}

const numberFormatter = new Intl.NumberFormat("en-US");
const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function configNumber(value: unknown) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? numberFormatter.format(number) : String(value);
}

function configDate(value: unknown) {
  const text = String(value);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  if (!match) return text;

  return shortDateFormatter.format(
    new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
  );
}

function naturalList(items: string[]) {
  if (items.length < 2) return items[0];
  if (items.length === 2) return `${items[0]} or ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, or ${items.at(-1)}`;
}

/** Plain-language constraints for a saved question. Shared by the viewer and editor. */
export function questionConfigSummary(q: TemplateQuestion): string[] {
  const c = q.config ?? {};
  const bits: string[] = [];
  if (Array.isArray(c.options) && c.options.length) {
    bits.push(`Options: ${naturalList(c.options as string[])}`);
  }
  if (c.min != null || c.max != null) {
    const subject = q.question_type === "rating" ? "Rating" : "Number";
    if (c.min != null && c.max != null) {
      bits.push(
        `${subject}: ${configNumber(c.min)} to ${configNumber(c.max)}`,
      );
    } else if (c.min != null) {
      bits.push(`${subject}: at least ${configNumber(c.min)}`);
    } else {
      bits.push(`${subject}: up to ${configNumber(c.max)}`);
    }
  }
  if (c.min_selections != null || c.max_selections != null) {
    if (c.min_selections != null && c.max_selections != null) {
      bits.push(
        `Choose ${configNumber(c.min_selections)} to ${configNumber(c.max_selections)} options`,
      );
    } else if (c.min_selections != null) {
      bits.push(`Choose at least ${configNumber(c.min_selections)} options`);
    } else {
      bits.push(`Choose up to ${configNumber(c.max_selections)} options`);
    }
  }
  if (c.max_length != null) {
    bits.push(`Up to ${configNumber(c.max_length)} characters`);
  }
  if (c.min_date != null || c.max_date != null) {
    if (c.min_date != null && c.max_date != null) {
      bits.push(`Available ${configDate(c.min_date)} to ${configDate(c.max_date)}`);
    } else if (c.min_date != null) {
      bits.push(`Available from ${configDate(c.min_date)}`);
    } else {
      bits.push(`Available through ${configDate(c.max_date)}`);
    }
  }
  return bits;
}

/** API request body for add (pass `orderIndex`) or update (omit it). */
export function questionFormBody(v: QuestionInput, orderIndex?: number) {
  const body: Record<string, unknown> = {
    prompt: v.prompt,
    question_type: v.question_type,
    config: buildQuestionConfig(v),
    time_limit_seconds: v.time_limit_seconds
      ? Number(v.time_limit_seconds)
      : null,
  };
  if (orderIndex !== undefined) body.order_index = orderIndex;
  return body;
}
