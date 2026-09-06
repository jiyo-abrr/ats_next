"use client";

import { useCallback, useEffect } from "react";

import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux";
import { fetchAttempt } from "@/lib/store/assessmentsSlice";

export function useAttempt(id: string) {
  const dispatch = useAppDispatch();
  const { attempt, loading, error, submitting } = useAppSelector(
    (s) => s.assessments,
  );

  useEffect(() => {
    if (id) dispatch(fetchAttempt(id));
  }, [dispatch, id]);

  const refetch = useCallback(() => {
    if (id) dispatch(fetchAttempt(id));
  }, [dispatch, id]);

  return {
    attempt: attempt?.id === id ? attempt : null,
    loading: loading && attempt?.id !== id,
    error,
    submitting,
    refetch,
  };
}
