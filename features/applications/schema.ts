import { z } from "zod";

import type {
  ApplicationStatus,
  AttemptStatus,
  QuestionType,
  TemplateType,
} from "@/lib/types";
import type { AssessmentAttempt } from "@/features/assessments/schema";

export interface ApplicationSummary {
  id: string;
  status: ApplicationStatus;
  created_at: string;
  job_post_id: string;
  job_title: string;
}

export interface ApplicantRollup {
  applicant_id: string;
  first_name: string;
  last_name: string;
  email: string;
  application_count: number;
  latest_applied_at: string;
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

export interface AttemptReviewQuestion {
  question_id: string;
  order_index: number;
  prompt: string;
  question_type: QuestionType;
  answer_value: unknown;
  answered_at: string | null;
}

/** GET /applications/{id}/assessments/review — one attempt, every question
 * with its answer, for HR/admin candidate comparison. */
export interface AttemptReview {
  attempt_id: string;
  template_type: TemplateType;
  template_title: string;
  status: AttemptStatus;
  started_at: string | null;
  completed_at: string | null;
  total_questions: number;
  answered_count: number;
  reopen_count: number;
  questions: AttemptReviewQuestion[];
}

export interface AttemptSummary {
  template_type: TemplateType;
  status: AttemptStatus;
  answered_count: number;
  total_questions: number;
  started_at: string | null;
  completed_at: string | null;
}

/** GET /applications/assessment-scorecard — one applicant per row with a
 * compact per-assessment roll-up (Compare tab). */
export interface ApplicationScorecard {
  id: string;
  created_at: string;
  status: ApplicationStatus;
  applicant_first_name: string;
  applicant_last_name: string;
  applicant_email: string;
  assessments: AttemptSummary[];
  evaluation: { recommendation: string | null; fit_score: number | null } | null;
}

export interface EvaluationScore {
  category: "resume" | "assessment";
  dimension: string;
  rating: "strong" | "qualified" | "below_bar" | "na";
  reason: string | null;
}

export interface ApplicationEvaluation {
  id: string;
  application_id: string;
  recommendation: "advance" | "hold" | "reject" | null;
  fit_score: number | null;
  seniority_assessed: string | null;
  summary: string | null;
  model: string | null;
  rubric_version: string | null;
  created_at: string;
  scores: EvaluationScore[];
}

export interface JobEvaluationRow {
  application_id: string;
  applicant_first_name: string;
  applicant_last_name: string;
  applicant_email: string;
  evaluation: ApplicationEvaluation | null;
}

export interface JobAssessmentReviewRow {
  application_id: string;
  applicant_first_name: string;
  applicant_last_name: string;
  applicant_email: string;
  attempt: AttemptReview | null;
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
