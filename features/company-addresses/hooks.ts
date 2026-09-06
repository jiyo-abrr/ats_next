"use client";

import { useCallback, useEffect } from "react";

import { buildBackendParams } from "@/lib/utils/query";
import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux";
import { useTableQuery } from "@/lib/hooks/use-table-query";
import { fetchCompanyAddresses } from "@/lib/store/companyAddressesSlice";

/** Everything `companyAddresses-view.tsx` needs: URL-driven list state + a refetch. */
export function useCompanyAddresses() {
  const dispatch = useAppDispatch();
  const table = useTableQuery();
  const qs = buildBackendParams(table.query).toString();
  const state = useAppSelector((s) => s.companyAddresses);

  useEffect(() => {
    dispatch(fetchCompanyAddresses(qs));
  }, [dispatch, qs]);

  const refetch = useCallback(() => {
    dispatch(fetchCompanyAddresses(qs));
  }, [dispatch, qs]);

  return { ...state, ...table, refetch };
}
