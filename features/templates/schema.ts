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

/** Human-readable config hints for a saved question — one line per hint.
 * Shared by the read-only view and the editable list. */
export function questionConfigSummary(q: TemplateQuestion): string[] {
  const c = q.config ?? {};
  const bits: string[] = [];
  if (Array.isArray(c.options) && c.options.length) {
    bits.push((c.options as string[]).join(" · "));
  }
  if (c.min != null || c.max != null) {
    bits.push(`range ${c.min ?? "–"}…${c.max ?? "–"}`);
  }
  if (c.min_selections != null || c.max_selections != null) {
    bits.push(`select ${c.min_selections ?? 0}–${c.max_selections ?? "∞"}`);
  }
  if (c.max_length != null) bits.push(`≤ ${c.max_length} chars`);
  if (c.min_date != null || c.max_date != null) {
    bits.push(`${c.min_date ?? "–"} → ${c.max_date ?? "–"}`);
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
