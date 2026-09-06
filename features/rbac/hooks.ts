"use client";

import { useCallback, useEffect } from "react";

import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux";
import { fetchRbac } from "@/lib/store/rbacSlice";

export function useRbac() {
  const dispatch = useAppDispatch();
  const state = useAppSelector((s) => s.rbac);

  useEffect(() => {
    dispatch(fetchRbac());
  }, [dispatch]);

  const refetch = useCallback(() => {
    dispatch(fetchRbac());
  }, [dispatch]);

  return { ...state, refetch };
}
