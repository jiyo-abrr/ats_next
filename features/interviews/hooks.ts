"use client";

import { useCallback, useEffect, useState } from "react";

import {
  getDateOverrides,
  getGlobalAvailability,
  getJobPostAvailability,
  getSchedule,
  getUpcomingInterviews,
} from "@/features/interviews/interviewsService";
import type {
  DateOverride,
  GlobalAvailability,
  JobPostAvailability,
  UpcomingInterview,
} from "@/features/interviews/schema";

export function useGlobalAvailability() {
  const [data, setData] = useState<GlobalAvailability | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    let active = true;
    void getGlobalAvailability()
      .then((d) => {
        if (!active) return;
        setData(d);
        setError(false);
      })
      .catch(() => active && setError(true))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [key]);

  return { data, loading, error, refetch: useCallback(() => setKey((k) => k + 1), []) };
}

export function useDateOverrides() {
  const [data, setData] = useState<DateOverride[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    let active = true;
    void getDateOverrides()
      .then((d) => {
        if (!active) return;
        setData(d);
        setError(false);
      })
      .catch(() => active && setError(true))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [key]);

  return {
    data,
    loading,
    error,
    refetch: useCallback(() => setKey((k) => k + 1), []),
  };
}

export function useUpcomingInterviews() {
  const [data, setData] = useState<UpcomingInterview[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void getUpcomingInterviews()
      .then((d) => active && setData(d))
      .catch(() => active && setData([]))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return { data, loading };
}

/** Confirmed interviews within [startIso, endIso) — refetches when the window
 * changes. */
export function useSchedule(startIso: string, endIso: string) {
  const [data, setData] = useState<UpcomingInterview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void getSchedule(startIso, endIso)
      .then((d) => {
        if (!active) return;
        setData(d);
      })
      .catch(() => active && setData([]))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [startIso, endIso]);

  return { data, loading };
}

export function useJobPostAvailability(jobPostId: string) {
  const [data, setData] = useState<JobPostAvailability | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (!jobPostId) return;
    let active = true;
    void getJobPostAvailability(jobPostId)
      .then((d) => {
        if (!active) return;
        setData(d);
        setError(false);
      })
      .catch(() => active && setError(true))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [jobPostId, key]);

  return { data, loading, error, refetch: useCallback(() => setKey((k) => k + 1), []) };
}
