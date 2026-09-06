import { z } from "zod";

import type { ApplicationStatus } from "@/lib/types";
import type { AssessmentAttempt } from "@/features/assessments/schema";

export interface ApplicationSummary {
  id: string;
  status: ApplicationStatus;
  created_at: string;
  job_post_id: string;
  job_title: string;
}

export interface Application {
  id: string;
  job_post_id: string;
  applicant_id: string;
  status: ApplicationStatus;
  resume_object_key: string;
  assessment_deadline: string | null;
  created_at: string;
  updated_at: string;
  allowed_status_transitions: ApplicationStatus[];
  can_withdraw: boolean;
}

/** HR/admin review-list projection (GET /applications). */
export interface ApplicationReview {
  id: string;
  status: ApplicationStatus;
  created_at: string;
  job_post_id: string;
  job_title: string;
  applicant_id: string;
  applicant_first_name: string;
  applicant_last_name: string;
  applicant_email: string;
  allowed_status_transitions: ApplicationStatus[];
  can_withdraw: boolean;
}

export interface DeadlineExtension {
  id: string;
  extended_by_user_id: string;
  reason: string;
  previous_deadline: string;
  new_deadline: string;
  extended_at: string;
}

export interface ApplicationAssessments {
  attempts: AssessmentAttempt[];
  deadline_extensions: DeadlineExtension[];
}

export interface StatusStats {
  by_status: Record<string, number>;
  total: number;
}

export const extendDeadlineSchema = z
  .object({
    reason: z.string().trim().min(1, "A reason is required"),
    mode: z.enum(["relative", "absolute"]),
    extend_by_days: z
      .string()
      .optional()
      .refine((v) => !v || Number(v) > 0, "Must be a positive number"),
    new_deadline: z.string().optional(),
  })
  .refine(
    (v) => (v.mode === "relative" ? !!v.extend_by_days : !!v.new_deadline),
    { message: "Fill in the extension", path: ["extend_by_days"] },
  );
export type ExtendDeadlineInput = z.infer<typeof extendDeadlineSchema>;
