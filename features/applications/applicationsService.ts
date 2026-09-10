import { apiClient, apiBlob } from "@/lib/api/client";
import type { Paginated } from "@/lib/types";
import type {
  ApplicantRollup,
  Application,
  ApplicationAssessments,
  ApplicationEvaluation,
  ApplicationScorecard,
  InterviewOpenSlot,
  InterviewRequest,
  InterviewRequestInput,
  AttemptReview,
  JobAssessmentReviewRow,
  JobEvaluationRow,
  ApplicationReview,
  ApplicationSummary,
  StatusStats,
} from "@/features/applications/schema";

// ---- Applicant ----
export const listMine = (qs: string) =>
  apiClient<Paginated<ApplicationSummary>>(
    qs ? `applications/me?${qs}` : "applications/me",
  );

export const get = (id: string) => apiClient<Application>(`applications/${id}`);

export const getAssessments = (id: string) =>
  apiClient<ApplicationAssessments>(`applications/${id}/assessments`);

export const getAssessmentsReview = (id: string) =>
  apiClient<AttemptReview[]>(`applications/${id}/assessments/review`);

export const create = (jobPostId: string) =>
  apiClient<Application>("applications", {
    method: "POST",
    body: JSON.stringify({ job_post_id: jobPostId }),
  });

export const withdraw = (id: string) =>
  apiClient<Application>(`applications/${id}/withdraw`, { method: "POST" });

export const resumeBlob = (id: string) =>
  apiBlob(`applications/${id}/resume`);

// ---- HR / admin ----
export const listForReview = (qs: string) =>
  apiClient<Paginated<ApplicationReview>>(
    qs ? `applications?${qs}` : "applications",
  );

export const listApplicants = (qs: string) =>
  apiClient<Paginated<ApplicantRollup>>(
    qs ? `applications/applicants?${qs}` : "applications/applicants",
  );

export const getAssessmentScorecard = (qs: string) =>
  apiClient<Paginated<ApplicationScorecard>>(
    `applications/assessment-scorecard?${qs}`,
  );

export const getJobAssessmentReview = (qs: string) =>
  apiClient<Paginated<JobAssessmentReviewRow>>(
    `applications/assessment-review?${qs}`,
  );

export const getJobEvaluations = (qs: string) =>
  apiClient<Paginated<JobEvaluationRow>>(`applications/evaluations?${qs}`);

export const exportEvaluationPack = (jobPostId: string) =>
  apiBlob(`applications/export?job_post_id=${jobPostId}`);

export const exportEvaluationsCsv = (jobPostId: string) =>
  apiBlob(`applications/evaluations/export?job_post_id=${jobPostId}`);

export const importEvaluations = (payload: unknown) =>
  apiClient<{ imported: number; skipped: string[] }>(
    "applications/evaluations/import",
    { method: "POST", body: JSON.stringify(payload) },
  );

export const getApplicationEvaluation = (id: string) =>
  apiClient<ApplicationEvaluation>(`applications/${id}/evaluation`);

// ---- Interview scheduling ----
export const getInterview = (applicationId: string) =>
  apiClient<InterviewRequest | null>(`applications/${applicationId}/interview`);

export const setInterview = (
  applicationId: string,
  payload: InterviewRequestInput,
) =>
  apiClient<InterviewRequest>(`applications/${applicationId}/interview`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

export const deleteInterview = (applicationId: string) =>
  apiClient<void>(`applications/${applicationId}/interview`, {
    method: "DELETE",
  });

export const getInterviewOpenSlots = (applicationId: string) =>
  apiClient<InterviewOpenSlot[]>(
    `applications/${applicationId}/interview/open-slots`,
  );

/** Confirm an interview time: an existing hand-picked slot (`slot_id`) or an
 * open availability instant (`starts_at`). */
export const selectInterviewSlot = (
  applicationId: string,
  pick: { slot_id: string } | { starts_at: string },
) =>
  apiClient<InterviewRequest>(
    `applications/${applicationId}/interview/select`,
    { method: "POST", body: JSON.stringify(pick) },
  );

export const updateStatus = (id: string, status: string) =>
  apiClient<Application>(`applications/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

export const extendDeadline = (
  id: string,
  body: { reason: string; new_deadline?: string; extend_by_days?: number },
) =>
  apiClient<Application>(`applications/${id}/extend-assessment-deadline`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });

export const reopenAttempt = (attemptId: string, reason: string) =>
  apiClient<unknown>(`assessment-attempts/${attemptId}/reopen`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });

export const stats = (jobPostId?: string) =>
  apiClient<StatusStats>(
    jobPostId ? `applications/stats?job_post_id=${jobPostId}` : "applications/stats",
  );
