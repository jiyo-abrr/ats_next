"use client";

import { useEffect } from "react";

import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux";
import { fetchDashboard } from "@/lib/store/dashboardSlice";

export function useDashboard() {
  const dispatch = useAppDispatch();
  const state = useAppSelector((s) => s.dashboard);

  useEffect(() => {
    dispatch(fetchDashboard());
  }, [dispatch]);

  return { ...state, refetch: () => dispatch(fetchDashboard()) };
}
