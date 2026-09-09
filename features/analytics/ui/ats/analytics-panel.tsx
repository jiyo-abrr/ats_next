"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/states";
import { cn } from "@/lib/cn";
import { useAnalyticsOverview } from "@/features/analytics/hooks";
import { asPeriod, type AnalyticsPeriod } from "@/features/analytics/schema";
import {
  Assessments,
  Evaluations,
  Hiring,
  Overview,
  Roles,
} from "./_parts/sections";
import { PositionFilter } from "./_parts/position-filter";

const views = [
  { key: "overview", label: "Overview" },
  { key: "hiring", label: "Hiring" },
  { key: "roles", label: "Roles" },
  { key: "assessments", label: "Assessments" },
  { key: "evaluations", label: "Evaluations" },
] as const;

type View = (typeof views)[number]["key"];

const periods: { value: AnalyticsPeriod; label: string }[] = [
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "all", label: "All time" },
];

function asView(value: string | null): View {
  return views.some((v) => v.key === value) ? (value as View) : "overview";
}

export function AnalyticsPanel() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const view = asView(searchParams.get("view"));
  const period = asPeriod(searchParams.get("period"));
  const positionId = searchParams.get("position") ?? "";

  const { data, loading, error, refresh } = useAnalyticsOverview(
    period,
    positionId || null,
  );

  const setParam = (key: "view" | "period" | "position", value: string) => {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  const selectClass =
    "border-input bg-background focus:ring-ring h-8 rounded-md border px-2 text-sm outline-none focus:ring-2";

  return (
    <section id="analytics" className="scroll-mt-20 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
          Analytics
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <PositionFilter
            value={positionId}
            onChange={(id) => setParam("position", id)}
          />
          <label>
            <span className="sr-only">Analytics period</span>
            <select
              value={period}
              onChange={(event) => setParam("period", event.target.value)}
              className={selectClass}
            >
              {periods.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={loading}
          >
            <RefreshCw className={loading ? "animate-spin" : undefined} />
            Refresh
          </Button>
        </div>
      </div>

      <nav
        aria-label="Analytics sections"
        className="flex gap-1 overflow-x-auto border-b pb-2"
      >
        {views.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setParam("view", tab.key)}
            className={cn(
              "shrink-0 rounded-md px-2.5 py-1.5 text-sm transition-colors",
              tab.key === view
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {error ? (
        <ErrorState message="Couldn't load analytics." onRetry={refresh} />
      ) : loading && !data ? (
        <div className="grid gap-3 xl:grid-cols-12">
          <Skeleton className="h-52 xl:col-span-7" />
          <Skeleton className="h-52 xl:col-span-5" />
          <Skeleton className="h-60 xl:col-span-12" />
        </div>
      ) : data ? (
        <>
          {view === "overview" ? <Overview data={data} /> : null}
          {view === "hiring" ? <Hiring data={data} /> : null}
          {view === "roles" ? <Roles data={data} /> : null}
          {view === "assessments" ? <Assessments data={data} /> : null}
          {view === "evaluations" ? <Evaluations data={data} /> : null}
        </>
      ) : null}
    </section>
  );
}
