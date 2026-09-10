"use client";

import { errorMessage } from "@/lib/api/client";
import { useEffect, useState } from "react";

/** Shared local-pagination fetch for both scorecard + per-assessment tables. */
export function usePaged<T>(fetcher: (qs: string) => Promise<{
  items: T[];
  total: number;
  pages: number;
}>) {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(25);
  const [state, setState] = useState<{
    items: T[];
    total: number;
    pages: number;
    loading: boolean;
    error: string | null;
  }>({ items: [], total: 0, pages: 0, loading: true, error: null });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const r = await fetcher(`page=${page}&size=${size}`);
        if (!active) return;
        setState({
          items: r.items,
          total: r.total,
          pages: r.pages,
          loading: false,
          error: null,
        });
      } catch (e) {
        if (active)
          setState((s) => ({ ...s, loading: false, error: errorMessage(e) }));
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size, reloadKey]);

  return {
    ...state,
    page,
    size,
    setPage,
    setSize,
    retry: () => setReloadKey((k) => k + 1),
  };
}
