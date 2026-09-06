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
  instructions: string | null;
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

export const questionSchema = z.object({
  prompt: z.string().trim().min(1, "Prompt is required").max(2000),
  instructions: z.string().trim().max(2000).optional(),
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
  min: z.string().trim().optional(),
  max: z.string().trim().optional(),
  time_limit_seconds: optionalNumeric,
});
export type QuestionInput = z.infer<typeof questionSchema>;

/** Build the API `config` object from the flat form values, per question type. */
export function buildQuestionConfig(
  v: QuestionInput,
): Record<string, unknown> | null {
  const cfg: Record<string, unknown> = {};
  if (v.question_type === "single_choice" || v.question_type === "multiple_choice") {
    cfg.options = (v.options ?? "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (v.question_type === "number" || v.question_type === "rating") {
    if (v.min) cfg.min = Number(v.min);
    if (v.max) cfg.max = Number(v.max);
  }
  return Object.keys(cfg).length ? cfg : null;
}
