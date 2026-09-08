"use client";

import { useCallback, useEffect } from "react";

import { buildBackendParams } from "@/lib/utils/query";
import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux";
import { useTableQuery } from "@/lib/hooks/use-table-query";
import { fetchRbac } from "@/lib/store/rbacSlice";
import { fetchUser, fetchUsers } from "@/lib/store/usersSlice";

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

/** One scope ("staff" = admin+HR, "applicants"), paginated — the two
 * `/ats/rbac/users` tabs. */
export function useUsers(scope: "staff" | "applicants") {
  const dispatch = useAppDispatch();
  const table = useTableQuery();
  const qs = `${buildBackendParams(table.query).toString()}&scope=${scope}`;
  const state = useAppSelector((s) => s.users);

  useEffect(() => {
    dispatch(fetchUsers(qs));
  }, [dispatch, qs]);

  const refetch = useCallback(() => {
    dispatch(fetchUsers(qs));
  }, [dispatch, qs]);

  return { ...state, ...table, refetch };
}

export function useUser(id: string) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.users.byId[id]);
  const detailLoading = useAppSelector((s) => s.users.detailLoading);
  const saving = useAppSelector((s) => s.users.saving);

  useEffect(() => {
    if (id) dispatch(fetchUser(id));
  }, [dispatch, id]);

  const refetch = useCallback(() => {
    if (id) dispatch(fetchUser(id));
  }, [dispatch, id]);

  return { user, loading: detailLoading && !user, saving, refetch };
}
