"use client";

import { Briefcase, ClipboardList } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { ErrorState } from "@/components/states";
import { APPLICATION_STATUS, JOB_POST_STATUS } from "@/lib/constants";
import { useDashboard } from "@/features/dashboard/hooks";

export function DashboardView() {
  const { applications, jobPosts, loading, error, refetch } = useDashboard();

  return (
    <div>
      <PageHeader title="Dashboard" description="Overview of hiring activity." />

      {error ? (
        <ErrorState message="Couldn't load the dashboard." onRetry={refetch} />
      ) : (
        <div className="space-y-8">
          <section className="space-y-3">
            <h2 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Applications
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Total"
                value={applications?.total ?? 0}
                icon={ClipboardList}
                href="/ats/applications"
                isLoading={loading}
              />
              {(["applied", "prescreening", "interview", "success"] as const).map(
                (s) => (
                  <StatCard
                    key={s}
                    label={APPLICATION_STATUS[s].label}
                    value={applications?.by_status[s] ?? 0}
                    href={`/ats/applications?f_status=${s}`}
                    isLoading={loading}
                  />
                ),
              )}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Job posts
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Total"
                value={jobPosts?.total ?? 0}
                icon={Briefcase}
                href="/ats/job-posts"
                isLoading={loading}
              />
              {(["draft", "published", "closed"] as const).map((s) => (
                <StatCard
                  key={s}
                  label={JOB_POST_STATUS[s].label}
                  value={jobPosts?.by_status[s] ?? 0}
                  href={`/ats/job-posts?f_status=${s}`}
                  isLoading={loading}
                />
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
