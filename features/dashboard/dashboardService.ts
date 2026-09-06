import { apiClient } from "@/lib/api/client";
import type { StatusStats } from "@/features/applications/schema";

export const applicationStats = () =>
  apiClient<StatusStats>("applications/stats");

export const jobPostStats = () => apiClient<StatusStats>("job-posts/stats");
