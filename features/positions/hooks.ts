"use client";

import { useCallback, useEffect } from "react";

import { buildBackendParams } from "@/lib/utils/query";
import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux";
import { useTableQuery } from "@/lib/hooks/use-table-query";
import { fetchPositions } from "@/lib/store/positionsSlice";

/** Everything `positions-view.tsx` needs: URL-driven list state + a refetch. */
export function usePositions() {
  const dispatch = useAppDispatch();
  const table = useTableQuery();
  const qs = buildBackendParams(table.query).toString();
  const state = useAppSelector((s) => s.positions);

  useEffect(() => {
    dispatch(fetchPositions(qs));
  }, [dispatch, qs]);

  const refetch = useCallback(() => {
    dispatch(fetchPositions(qs));
  }, [dispatch, qs]);

  return { ...state, ...table, refetch };
}
