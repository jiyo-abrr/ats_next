import type {
  ApplicationStatus,
  AttemptStatus,
  EmploymentType,
  JobPostStatus,
  QuestionType,
  Role,
  TemplateType,
} from "@/lib/types";

export type BadgeTone = "neutral" | "info" | "success" | "warning" | "danger";

/** Human-readable labels + badge tones for enum values used across both surfaces. */

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
  internship: "Internship",
  temporary: "Temporary",
};

export const JOB_POST_STATUS: Record<
  JobPostStatus,
  { label: string; tone: BadgeTone }
> = {
  draft: { label: "Draft", tone: "neutral" },
  published: { label: "Published", tone: "success" },
  closed: { label: "Closed", tone: "danger" },
};

export const APPLICATION_STATUS: Record<
  ApplicationStatus,
  { label: string; tone: BadgeTone }
> = {
  applied: { label: "Applied", tone: "info" },
  prescreening: { label: "Prescreening", tone: "info" },
  interview: { label: "Interview", tone: "warning" },
  denied: { label: "Denied", tone: "danger" },
  success: { label: "Hired", tone: "success" },
  failed: { label: "Not selected", tone: "danger" },
  disqualified: { label: "Disqualified", tone: "danger" },
  withdrawn: { label: "Withdrawn", tone: "neutral" },
};

export const ATTEMPT_STATUS: Record<
  AttemptStatus,
  { label: string; tone: BadgeTone }
> = {
  not_started: { label: "Not started", tone: "neutral" },
  in_progress: { label: "In progress", tone: "info" },
  completed: { label: "Completed", tone: "success" },
  expired: { label: "Expired", tone: "danger" },
};

export const TEMPLATE_TYPE_LABELS: Record<TemplateType, string> = {
  pre_assessment: "Pre-assessment",
  culture_fit: "Culture fit",
  technical: "Technical",
};

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  text: "Short text",
  long_text: "Long text",
  single_choice: "Single choice",
  multiple_choice: "Multiple choice",
  boolean: "Yes / No",
  number: "Number",
  rating: "Rating",
  date: "Date",
};

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Admin",
  hr: "HR",
  applicant: "Applicant",
};

// Pipeline rules (allowed transitions, can-withdraw) are NOT here — they come
// off the API as `allowed_status_transitions` / `can_withdraw` on ApplicationOut.

export const CURRENCY_OPTIONS: { value: string; label: string }[] = [
  { value: "PHP", label: "₱ PHP — Philippine peso" },
  { value: "USD", label: "$ USD — US dollar" },
  { value: "EUR", label: "€ EUR — Euro" },
  { value: "GBP", label: "£ GBP — Pound sterling" },
  { value: "SGD", label: "S$ SGD — Singapore dollar" },
  { value: "AUD", label: "A$ AUD — Australian dollar" },
  { value: "CAD", label: "C$ CAD — Canadian dollar" },
  { value: "JPY", label: "¥ JPY — Japanese yen" },
  { value: "HKD", label: "HK$ HKD — Hong Kong dollar" },
  { value: "MYR", label: "RM MYR — Malaysian ringgit" },
  { value: "INR", label: "₹ INR — Indian rupee" },
  { value: "CNY", label: "¥ CNY — Chinese yuan" },
];
