"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  type SortState,
  type TableQuery,
  parseTableQuery,
  tableQueryToSearchParams,
} from "@/lib/utils/query";

/**
 * URL-backed table state. All list pages share this so pagination / sort /
 * filters are shareable and survive refresh.
 */
export function useTableQuery(opts: {
  filterKeys?: string[];
  defaultSize?: number;
} = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const defaultSize = opts.defaultSize;
  const filterKeysKey = (opts.filterKeys ?? []).join(",");

  const query = useMemo(
    () =>
      parseTableQuery(new URLSearchParams(searchParams.toString()), {
        filterKeys: filterKeysKey ? filterKeysKey.split(",") : [],
        defaultSize,
      }),
    [searchParams, filterKeysKey, defaultSize],
  );

  const commit = useCallback(
    (next: TableQuery) => {
      const qs = tableQueryToSearchParams(next).toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname],
  );

  const setPage = useCallback(
    (page: number) => commit({ ...query, page }),
    [commit, query],
  );
  const setSize = useCallback(
    (size: number) => commit({ ...query, size, page: 1 }),
    [commit, query],
  );
  const setSearch = useCallback(
    (search: string) => commit({ ...query, search, page: 1 }),
    [commit, query],
  );
  const setSort = useCallback(
    (sort: SortState | null) => commit({ ...query, sort, page: 1 }),
    [commit, query],
  );
  const setFilter = useCallback(
    (key: string, value: string) =>
      commit({
        ...query,
        filters: { ...query.filters, [key]: value },
        page: 1,
      }),
    [commit, query],
  );
  const toggleSort = useCallback(
    (columnId: string) => {
      if (!query.sort || query.sort.id !== columnId) {
        setSort({ id: columnId, desc: false });
      } else if (!query.sort.desc) {
        setSort({ id: columnId, desc: true });
      } else {
        setSort(null);
      }
    },
    [query.sort, setSort],
  );

  return {
    query,
    setPage,
    setSize,
    setSearch,
    setSort,
    setFilter,
    toggleSort,
  };
}
