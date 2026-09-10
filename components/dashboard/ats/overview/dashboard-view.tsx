"use client";

import Link from "next/link";
import { Plus, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/states";
import { AnalyticsPanel } from "@/components/dashboard/ats/overview/analytics/analytics-panel";
import { useCurrentUser } from "@/features/auth/hooks";
import { useDashboard } from "@/features/dashboard/hooks";
import { WorkQueueTiles } from "./shared/work-queue-tiles";

function greeting(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function DashboardView() {
  const { applications, jobPosts, loading, error, refetch } = useDashboard();
  const user = useCurrentUser();
  const isAdmin = user?.role === "admin";

  if (error) {
    return (
      <ErrorState message="Couldn't load the dashboard." onRetry={refetch} />
    );
  }

  const counts =
    applications || jobPosts
      ? {
          applied: applications?.by_status.applied ?? 0,
          prescreening: applications?.by_status.prescreening ?? 0,
          interview: applications?.by_status.interview ?? 0,
          draft: jobPosts?.by_status.draft ?? 0,
        }
      : null;

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1
            className="text-2xl font-semibold tracking-tight"
            suppressHydrationWarning
          >
            {greeting(new Date().getHours())}
            {user?.first_name ? `, ${user.first_name}` : ""}
          </h1>
          <p className="text-muted-foreground text-sm">
            What needs your attention right now.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={loading}
          >
            <RefreshCw className={loading ? "animate-spin" : undefined} />
            Refresh
          </Button>
          <Button asChild size="sm">
            <Link href="/ats/job-posts/new">
              <Plus /> New job post
            </Link>
          </Button>
        </div>
      </header>

      {isAdmin ? (
        <AnalyticsPanel />
      ) : (
        <WorkQueueTiles counts={counts} loading={loading} />
      )}
    </div>
  );
}
