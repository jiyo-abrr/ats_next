import type { AttemptStatus, QuestionType, TemplateType } from "@/lib/types";

export interface AssessmentAnswer {
  id: string;
  question_id: string;
  question_started_at: string;
  answered_at: string | null;
  answer_value: unknown;
}

export interface AssessmentAttemptReopen {
  id: string;
  reopened_by_user_id: string;
  reason: string;
  reopened_at: string | null;
}

export interface AssessmentAttempt {
  id: string;
  application_id: string;
  template_type: TemplateType;
  template_id: string;
  status: AttemptStatus;
  started_at: string | null;
  completed_at: string | null;
  answers: AssessmentAnswer[];
  reopens: AssessmentAttemptReopen[];
  answered_count: number;
  total_questions: number;
}

export interface CurrentQuestion {
  id: string;
  order_index: number;
  prompt: string;
  instructions: string | null;
  question_type: QuestionType;
  config: Record<string, unknown> | null;
  time_limit_seconds: number | null;
}

/** GET /assessment-attempts/{id} — applicant take-assessment view. */
export interface AttemptDetail {
  id: string;
  application_id: string;
  template_type: TemplateType;
  template_id: string;
  status: AttemptStatus;
  started_at: string | null;
  completed_at: string | null;
  template_title: string;
  template_instructions: string | null;
  time_limit_minutes: number | null;
  total_questions: number;
  answered_count: number;
  current_question: CurrentQuestion | null;
  current_question_started_at: string | null;
  current_answer_value: unknown;
}
