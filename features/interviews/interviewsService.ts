import { apiClient } from "@/lib/api/client";
import type {
  DateOverride,
  DateOverrideInput,
  GlobalAvailability,
  GlobalAvailabilityInput,
  InterviewStatus,
  Interviewer,
  JobPostAvailability,
  JobPostAvailabilityInput,
  UpcomingInterview,
} from "@/features/interviews/schema";

/** Admin + HR accounts — the pool for a job post's interviewer list. Available
 * to any manage_applications user (unlike the admin-only /auth/users list). */
export const listInterviewStaff = () =>
  apiClient<Interviewer[]>("interview-availability/staff");

/** Confirmed interviews from now on, soonest first. */
export const getUpcomingInterviews = () =>
  apiClient<UpcomingInterview[]>("interview-availability/upcoming");

/** Confirmed interviews starting within [start, end) — the schedule calendar's
 * visible window. Both bounds are ISO instants. */
export const getSchedule = (startIso: string, endIso: string) =>
  apiClient<UpcomingInterview[]>(
    `interview-availability/schedule?start=${encodeURIComponent(
      startIso,
    )}&end=${encodeURIComponent(endIso)}`,
  );

/** awaiting / confirmed per application with an interview request, for one job
 * post — the pipeline view's Interview column. */
export const getInterviewStatuses = (jobPostId: string) =>
  apiClient<InterviewStatus[]>(
    `interview-availability/statuses?job_post_id=${jobPostId}`,
  );

export const getGlobalAvailability = () =>
  apiClient<GlobalAvailability>("interview-availability");

export const setGlobalAvailability = (payload: GlobalAvailabilityInput) =>
  apiClient<GlobalAvailability>("interview-availability", {
    method: "PUT",
    body: JSON.stringify(payload),
  });

/** All global date overrides, soonest first. Managed on the dedicated
 * `/ats/calendar/overrides` page (kept off the config page so a year's worth
 * doesn't clog it). */
export const getDateOverrides = () =>
  apiClient<DateOverride[]>("interview-availability/overrides");

/** Whole-list replace — the overrides page and its CSV import send everything. */
export const setDateOverrides = (overrides: DateOverrideInput[]) =>
  apiClient<DateOverride[]>("interview-availability/overrides", {
    method: "PUT",
    body: JSON.stringify({ overrides }),
  });

export const getJobPostAvailability = (jobPostId: string) =>
  apiClient<JobPostAvailability>(
    `interview-availability/job-posts/${jobPostId}`,
  );

export const setJobPostAvailability = (
  jobPostId: string,
  payload: JobPostAvailabilityInput,
) =>
  apiClient<JobPostAvailability>(
    `interview-availability/job-posts/${jobPostId}`,
    { method: "PUT", body: JSON.stringify(payload) },
  );
