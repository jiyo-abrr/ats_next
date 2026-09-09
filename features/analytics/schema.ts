export type AnalyticsPeriod = "30d" | "90d" | "all";

export interface AnalyticsActivityPoint {
  date: string;
  count: number;
}

export interface AnalyticsStatusCount {
  key: string;
  count: number;
}

export interface HiringAnalytics {
  total_applications: number;
  unique_applicants: number;
  active_candidates: number;
  hires: number;
  hire_conversion_rate: number;
  overdue_assessments: number;
  by_status: AnalyticsStatusCount[];
  application_activity: AnalyticsActivityPoint[];
}

export interface RolePerformance {
  id: string;
  job_title: string;
  status: "draft" | "published" | "closed";
  position_title: string;
  location_label: string;
  application_count: number;
  active_candidates: number;
  hires: number;
  hire_conversion_rate: number;
}

export interface PositionPerformance {
  id: string;
  position_title: string;
  job_post_count: number;
  application_count: number;
  active_candidates: number;
  hires: number;
  hire_conversion_rate: number;
}

export interface RolesAnalytics {
  total_job_posts: number;
  published_job_posts: number;
  draft_job_posts: number;
  roles: RolePerformance[];
  positions: PositionPerformance[];
}

export interface AssessmentTemplateAnalytics {
  template_type: "pre_assessment" | "culture_fit" | "technical";
  attempts: number;
  not_started: number;
  in_progress: number;
  completed: number;
  expired: number;
  completion_rate: number;
  average_completion_minutes: number | null;
}

export interface AssessmentsAnalytics {
  total_attempts: number;
  started_attempts: number;
  completed_attempts: number;
  expired_attempts: number;
  completion_rate: number;
  started_completion_rate: number;
  average_completion_minutes: number | null;
  reopen_count: number;
  templates: AssessmentTemplateAnalytics[];
}

export interface EvaluationDimension {
  category: string;
  dimension: string;
  strong: number;
  qualified: number;
  below_bar: number;
  na: number;
}

export interface EvaluationsAnalytics {
  evaluated_applications: number;
  evaluation_coverage_rate: number;
  average_fit_score: number | null;
  recommendations: AnalyticsStatusCount[];
  evaluation_activity: AnalyticsActivityPoint[];
  fit_score_bands: AnalyticsStatusCount[];
  score_dimensions: EvaluationDimension[];
}

export interface AnalyticsOverview {
  period: AnalyticsPeriod;
  job_post_id: string | null;
  hiring: HiringAnalytics;
  roles: RolesAnalytics;
  assessments: AssessmentsAnalytics;
  evaluations: EvaluationsAnalytics;
}

/** Coerce an arbitrary query-string value to a valid period (default 90d). */
export function asPeriod(value: string | null): AnalyticsPeriod {
  return value === "30d" || value === "all" ? value : "90d";
}
