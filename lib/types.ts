/**
 * Framework-agnostic shared types only: the pagination envelope and the enum
 * string-literal unions. Domain *response interfaces* live in the owning
 * `features/<x>/schema.ts` — keeping this file (and all of `lib/`) a leaf.
 */

export type Role = "admin" | "hr" | "applicant";

/** The authenticated user — foundational (auth, guard, menus, rbac all need it). */
export interface User {
  id: string;
  first_name: string;
  middle_initial: string | null;
  last_name: string;
  contact_number: string;
  email: string;
  role: Role;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/** `fastapi-pagination` page envelope. */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// ---- Enum unions (StrEnum values from the backend) ----

export type EmploymentType =
  | "full_time"
  | "part_time"
  | "contract"
  | "internship"
  | "temporary";

export type JobPostStatus = "draft" | "published" | "closed";

export type ApplicationStatus =
  | "applied"
  | "prescreening"
  | "interview"
  | "denied"
  | "success"
  | "failed"
  | "disqualified"
  | "withdrawn";

export type AttemptStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "expired";

export type TemplateType = "pre_assessment" | "culture_fit" | "technical";

export type QuestionType =
  | "text"
  | "long_text"
  | "single_choice"
  | "multiple_choice"
  | "boolean"
  | "number"
  | "rating"
  | "date";
