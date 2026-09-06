"use client";

import { useCallback, useEffect } from "react";

import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux";
import { useTableQuery } from "@/lib/hooks/use-table-query";
import {
  fetchApplication,
  fetchApplicationAssessments,
  fetchApplicationsForReview,
  fetchMyApplications,
} from "@/lib/store/applicationsSlice";

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
