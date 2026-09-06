import { apiClient, apiBlob } from "@/lib/api/client";
import type { Paginated } from "@/lib/types";
import type {
  Application,
  ApplicationAssessments,
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
