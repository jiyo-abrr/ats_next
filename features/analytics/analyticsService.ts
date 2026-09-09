import { apiClient } from "@/lib/api/client";
import type { AnalyticsOverview, AnalyticsPeriod } from "./schema";

export const getOverview = (
  period: AnalyticsPeriod,
  positionId?: string | null,
) =>
  apiClient<AnalyticsOverview>(
    `analytics/overview?period=${period}` +
      (positionId ? `&position_id=${positionId}` : ""),
  );
