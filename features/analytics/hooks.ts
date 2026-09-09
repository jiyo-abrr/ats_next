"use client";

import { useCallback, useEffect, useState } from "react";

import { errorMessage } from "@/lib/api/client";
import * as analyticsService from "./analyticsService";
import type { AnalyticsOverview, AnalyticsPeriod } from "./schema";

export function useAnalyticsOverview(
  period: AnalyticsPeriod,
  positionId?: string | null,
) {
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    // A changed period/refresh is a distinct remote dataset — reset state before
    // the request resolves rather than showing the previous period's numbers.
    /* eslint-disable react-hooks/set-state-in-effect */
    setLoading(true);
    setError(null);
    /* eslint-enable react-hooks/set-state-in-effect */
    void analyticsService
      .getOverview(period, positionId)
      .then((result) => {
        if (active) setData(result);
      })
      .catch((reason) => {
        if (active) setError(errorMessage(reason));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [period, positionId, refreshKey]);

  return {
    data,
    loading,
    error,
    refresh: useCallback(() => setRefreshKey((key) => key + 1), []),
  };
}
