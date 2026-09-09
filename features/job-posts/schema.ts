import { z } from "zod";

import type { CurrencyCode, EmploymentType, JobPostStatus } from "@/lib/types";
import type { Tag } from "@/features/tags/schema";

export interface JobPost {
  id: string;
  job_title: string;
  description: string;
  requirements: string;
  qualifications: string;
  salary_min: string | null;
  salary_max: string | null;
  currency: CurrencyCode;
  employment_type: EmploymentType;
  status: JobPostStatus;
  company_address_id: string;
  company_address_label: string;
  position_id: string;
  position_title: string;
  assessment_window_days: number;
  tags: Tag[];
  excluded_job_post_ids: string[];
  pre_assessment_template_id: string | null;
  culture_fit_template_id: string | null;
  technical_assessment_template_id: string | null;
  created_at: string;
  updated_at: string;
}

const money = z
  .string()
  .trim()
  .optional()
  .refine((v) => !v || !Number.isNaN(Number(v)), "Must be a number");

const windowDays = z
  .string()
  .trim()
  .refine((v) => {
    const n = Number(v);
    return Number.isInteger(n) && n >= 1 && n <= 60;
  }, "1–60 days");

/** Details form — shared by create and edit; relationships (tags / exclusions /
 * templates) are managed on the detail-view tabs via dedicated endpoints. */
/** TipTap serialises empty as "<p></p>"; validate on the visible text. */
const richText = (max = 10000) =>
  z
    .string()
    .max(max, `Too long (max ${max})`)
    .refine(
      (v) => v.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim().length > 0,
      "Required",
    );

export const jobPostSchema = z
  .object({
    job_title: z.string().trim().min(1, "Required").max(200),
    description: richText(),
    requirements: richText(),
    qualifications: richText(),
    salary_min: money,
    salary_max: money,
    currency: z.enum([
      "PHP",
      "USD",
      "EUR",
      "GBP",
      "SGD",
      "AUD",
      "CAD",
      "JPY",
      "HKD",
      "MYR",
      "INR",
      "CNY",
    ]),
    employment_type: z.enum([
      "full_time",
      "part_time",
      "contract",
      "internship",
      "temporary",
    ]),
    status: z.enum(["draft", "published", "closed"]),
    company_address_id: z.string().min(1, "Select a location"),
    position_id: z.string().min(1, "Select a position"),
    assessment_window_days: windowDays,
  })
  .refine(
    (v) =>
      !v.salary_min ||
      !v.salary_max ||
      Number(v.salary_min) <= Number(v.salary_max),
    { message: "Min must be ≤ max", path: ["salary_max"] },
  );
export type JobPostInput = z.infer<typeof jobPostSchema>;
