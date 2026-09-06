"use client";

import { useCallback, useEffect } from "react";

import { buildBackendParams } from "@/lib/utils/query";
import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux";
import { useTableQuery } from "@/lib/hooks/use-table-query";
import { fetchJobPost, fetchJobPosts } from "@/lib/store/jobPostsSlice";

/** Careers job browse — published-only, newest first by default. */
export function useJobList() {
  const dispatch = useAppDispatch();
  const table = useTableQuery({ filterKeys: ["employment_type"] });
  const qs = buildBackendParams(
    { ...table.query, sort: table.query.sort ?? { id: "created_at", desc: true } },
    {},
    { status: { $eq: "published" } },
  ).toString();

  const { list, listTotal, listPages, listLoading, listError } = useAppSelector(
    (s) => s.jobPosts,
  );

  useEffect(() => {
    dispatch(fetchJobPosts(qs));
  }, [dispatch, qs]);

  const refetch = useCallback(() => {
    dispatch(fetchJobPosts(qs));
  }, [dispatch, qs]);

  return {
    ...table,
    jobs: list,
    total: listTotal,
    pages: listPages,
    loading: listLoading,
    error: listError,
    refetch,
  };
}

/** ATS job-posts management list — all statuses, filterable. */
export function useJobPostsList() {
  const dispatch = useAppDispatch();
  const table = useTableQuery({
    filterKeys: ["status", "employment_type", "position_id"],
  });
  const qs = buildBackendParams({
    ...table.query,
    sort: table.query.sort ?? { id: "created_at", desc: true },
  }).toString();

  const { list, listTotal, listPages, listLoading, listError } = useAppSelector(
    (s) => s.jobPosts,
  );

  useEffect(() => {
    dispatch(fetchJobPosts(qs));
  }, [dispatch, qs]);

  const refetch = useCallback(() => {
    dispatch(fetchJobPosts(qs));
  }, [dispatch, qs]);

  return {
    ...table,
    jobs: list,
    total: listTotal,
    pages: listPages,
    loading: listLoading,
    error: listError,
    refetch,
  };
}

export function useJobPost(id: string) {
  const dispatch = useAppDispatch();
  const job = useAppSelector((s) => s.jobPosts.byId[id]);
  const loading = useAppSelector((s) => s.jobPosts.detailLoading);
  const error = useAppSelector((s) => s.jobPosts.detailError);
  const saving = useAppSelector((s) => s.jobPosts.saving);

  useEffect(() => {
    if (id) dispatch(fetchJobPost(id));
  }, [dispatch, id]);

  const refetch = useCallback(() => {
    if (id) dispatch(fetchJobPost(id));
  }, [dispatch, id]);

  return { job, loading: loading && !job, error, saving, refetch };
}
