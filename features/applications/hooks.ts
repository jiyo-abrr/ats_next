"use client";

import { useCallback, useEffect, useState } from "react";

import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux";
import { useTableQuery } from "@/lib/hooks/use-table-query";
import { buildBackendParams } from "@/lib/utils/query";
import {
  fetchApplicants,
  fetchApplication,
  fetchApplicationAssessments,
  fetchApplicationsForReview,
  fetchMyApplications,
} from "@/lib/store/applicationsSlice";
import { getInterview } from "@/features/applications/applicationsService";
import type { InterviewRequest } from "@/features/applications/schema";

export function useMyApplications() {
  const dispatch = useAppDispatch();
  const table = useTableQuery();
  const qs = new URLSearchParams({
    page: String(table.query.page),
    size: String(table.query.size),
  }).toString();
  const { mine, mineTotal, minePages, mineLoading, mineError } = useAppSelector(
    (s) => s.applications,
  );

  useEffect(() => {
    dispatch(fetchMyApplications(qs));
  }, [dispatch, qs]);

  const refetch = useCallback(
    () => dispatch(fetchMyApplications(qs)),
    [dispatch, qs],
  );

  return {
    ...table,
    data: mine,
    total: mineTotal,
    pages: minePages,
    loading: mineLoading,
    error: mineError,
    refetch,
  };
}

export function useApplication(id: string) {
  const dispatch = useAppDispatch();
  const { current, currentLoading, currentError, acting } = useAppSelector(
    (s) => s.applications,
  );

  useEffect(() => {
    if (id) dispatch(fetchApplication(id));
  }, [dispatch, id]);

  const refetch = useCallback(() => {
    if (id) dispatch(fetchApplication(id));
  }, [dispatch, id]);

  return {
    application: current?.id === id ? current : null,
    loading: currentLoading,
    error: currentError,
    acting,
    refetch,
  };
}

/** ATS review list — filter by status + optional job_post_id (typed params, no querybuilder). */
export function useApplicationsForReview() {
  const dispatch = useAppDispatch();
  const table = useTableQuery({ filterKeys: ["status", "job_post_id"] });
  const params = new URLSearchParams({
    page: String(table.query.page),
    size: String(table.query.size),
  });
  if (table.query.filters.status) params.set("status", table.query.filters.status);
  if (table.query.filters.job_post_id)
    params.set("job_post_id", table.query.filters.job_post_id);
  const qs = params.toString();

  const { review, reviewTotal, reviewPages, reviewLoading, reviewError } =
    useAppSelector((s) => s.applications);

  useEffect(() => {
    dispatch(fetchApplicationsForReview(qs));
  }, [dispatch, qs]);

  const refetch = useCallback(
    () => dispatch(fetchApplicationsForReview(qs)),
    [dispatch, qs],
  );

  return {
    ...table,
    data: review,
    total: reviewTotal,
    pages: reviewPages,
    loading: reviewLoading,
    error: reviewError,
    refetch,
  };
}

/** Applicants for one job post — the review list scoped to `job_post_id`, with a
 * status sub-filter. Shares the review slice (re-fetched on mount elsewhere). */
export function useJobApplicants(jobPostId: string) {
  const dispatch = useAppDispatch();
  const table = useTableQuery({ filterKeys: ["status"] });
  const params = new URLSearchParams({
    job_post_id: jobPostId,
    page: String(table.query.page),
    size: String(table.query.size),
  });
  if (table.query.filters.status)
    params.set("status", table.query.filters.status);
  const qs = params.toString();

  const { review, reviewTotal, reviewPages, reviewLoading, reviewError } =
    useAppSelector((s) => s.applications);

  useEffect(() => {
    dispatch(fetchApplicationsForReview(qs));
  }, [dispatch, qs]);

  const refetch = useCallback(
    () => dispatch(fetchApplicationsForReview(qs)),
    [dispatch, qs],
  );

  return {
    ...table,
    data: review,
    total: reviewTotal,
    pages: reviewPages,
    loading: reviewLoading,
    error: reviewError,
    refetch,
  };
}

/** The interview request + slots for one application (null until HR schedules
 * one). Used by both the HR scheduler card and the applicant's slot picker. */
export function useInterview(applicationId: string) {
  const [interview, setInterview] = useState<InterviewRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!applicationId) return;
    let active = true;
    void getInterview(applicationId)
      .then((data) => {
        if (!active) return;
        setInterview(data);
        setError(false);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [applicationId, reloadKey]);

  return {
    interview,
    loading,
    error,
    setInterview,
    refetch: () => setReloadKey((k) => k + 1),
  };
}

export function useApplicationAssessments(id: string) {
  const dispatch = useAppDispatch();
  const { assessments, assessmentsLoading } = useAppSelector(
    (s) => s.applications,
  );

  useEffect(() => {
    if (id) dispatch(fetchApplicationAssessments(id));
  }, [dispatch, id]);

  const refetch = useCallback(() => {
    if (id) dispatch(fetchApplicationAssessments(id));
  }, [dispatch, id]);

  return { assessments, loading: assessmentsLoading, refetch };
}

/** ATS applicant-centric list — one row per person who has applied, with a
 * name/email search. Backed by GET /applications/applicants. */
export function useApplicants() {
  const dispatch = useAppDispatch();
  const table = useTableQuery();
  const qs = buildBackendParams(table.query).toString();

  const {
    applicants,
    applicantsTotal,
    applicantsPages,
    applicantsLoading,
    applicantsError,
  } = useAppSelector((s) => s.applications);

  useEffect(() => {
    dispatch(fetchApplicants(qs));
  }, [dispatch, qs]);

  const refetch = useCallback(
    () => dispatch(fetchApplicants(qs)),
    [dispatch, qs],
  );

  return {
    ...table,
    data: applicants,
    total: applicantsTotal,
    pages: applicantsPages,
    loading: applicantsLoading,
    error: applicantsError,
    refetch,
  };
}

/** Every application belonging to one applicant — the review list scoped to
 * `applicant_id`, with a status sub-filter. Shares the review slice. */
export function useApplicantApplications(applicantId: string) {
  const dispatch = useAppDispatch();
  const table = useTableQuery({ filterKeys: ["status"] });
  const params = new URLSearchParams({
    applicant_id: applicantId,
    page: String(table.query.page),
    size: String(table.query.size),
  });
  if (table.query.filters.status)
    params.set("status", table.query.filters.status);
  const qs = params.toString();

  const { review, reviewTotal, reviewPages, reviewLoading, reviewError } =
    useAppSelector((s) => s.applications);

  useEffect(() => {
    dispatch(fetchApplicationsForReview(qs));
  }, [dispatch, qs]);

  const refetch = useCallback(
    () => dispatch(fetchApplicationsForReview(qs)),
    [dispatch, qs],
  );

  return {
    ...table,
    data: review,
    total: reviewTotal,
    pages: reviewPages,
    loading: reviewLoading,
    error: reviewError,
    refetch,
  };
}

/** Job-post hiring-pipeline tab — one stage at a time, paginated. `stage` is a
 * URL filter that maps to one or more application statuses. */
const PIPELINE_STAGE_STATUSES: Record<string, string[]> = {
  applied: ["applied"],
  prescreening: ["prescreening"],
  interview: ["interview"],
  hired: ["success"],
  closed: ["denied", "failed", "disqualified", "withdrawn"],
};

export const PIPELINE_STAGES: { key: string; label: string }[] = [
  { key: "applied", label: "Applied" },
  { key: "prescreening", label: "Prescreening" },
  { key: "interview", label: "Interview" },
  { key: "hired", label: "Hired" },
  { key: "closed", label: "Not proceeding" },
];

export function useJobPipelineStage(jobPostId: string) {
  const dispatch = useAppDispatch();
  const table = useTableQuery({ filterKeys: ["stage"] });
  const stage = table.query.filters.stage || "applied";
  const statuses =
    PIPELINE_STAGE_STATUSES[stage] ?? PIPELINE_STAGE_STATUSES.applied;

  const params = new URLSearchParams({
    job_post_id: jobPostId,
    page: String(table.query.page),
    size: String(table.query.size),
  });
  statuses.forEach((s) => params.append("status", s));
  const qs = params.toString();

  const { review, reviewTotal, reviewPages, reviewLoading, reviewError } =
    useAppSelector((s) => s.applications);

  useEffect(() => {
    dispatch(fetchApplicationsForReview(qs));
  }, [dispatch, qs]);

  const refetch = useCallback(
    () => dispatch(fetchApplicationsForReview(qs)),
    [dispatch, qs],
  );

  return {
    ...table,
    stage,
    setStage: (v: string) => table.setFilter("stage", v),
    data: review,
    total: reviewTotal,
    pages: reviewPages,
    loading: reviewLoading,
    error: reviewError,
    refetch,
  };
}
