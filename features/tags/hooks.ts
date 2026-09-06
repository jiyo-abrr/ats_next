"use client";

import { useCallback, useEffect } from "react";

import { buildBackendParams } from "@/lib/utils/query";
import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux";
import { useTableQuery } from "@/lib/hooks/use-table-query";
import { fetchTags } from "@/lib/store/tagsSlice";

/** Everything `tags-view.tsx` needs: URL-driven list state + a refetch. */
export function useTags() {
  const dispatch = useAppDispatch();
  const table = useTableQuery();
  const qs = buildBackendParams(table.query).toString();
  const state = useAppSelector((s) => s.tags);

  useEffect(() => {
    dispatch(fetchTags(qs));
  }, [dispatch, qs]);

  const refetch = useCallback(() => {
    dispatch(fetchTags(qs));
  }, [dispatch, qs]);

  return { ...state, ...table, refetch };
}
