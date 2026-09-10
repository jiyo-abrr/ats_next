"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalyticsOverview } from "@/features/analytics/schema";
import { JOB_POST_STATUS } from "@/lib/constants";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { EmptyMessage, MetricGrid, number, percent } from "../primitives";

/** One row of a ranked list: label + volume bar + secondary stats. */
function RankRow({
  title,
  badge,
  subtitle,
  value,
  barPct,
  meta,
  href,
}: {
  title: string;
  badge?: string;
  subtitle?: string;
  value: number;
  barPct: number;
  meta: string;
  href?: string;
}) {
  const body = (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate text-sm font-medium">{title}</span>
          {badge ? (
            <Badge variant="secondary" className="shrink-0 font-normal">
              {badge}
            </Badge>
          ) : null}
        </div>
        <span className="shrink-0 text-lg leading-none font-semibold tabular-nums">
          {number(value)}
        </span>
      </div>
      <div className="bg-muted h-1.5 overflow-hidden rounded-full">
        <div
          className="bg-primary h-full rounded-full"
          style={{ width: `${Math.max(barPct, value ? 4 : 0)}%` }}
        />
      </div>
      <p className="text-muted-foreground truncate text-xs">
        {subtitle ? `${subtitle} · ` : ""}
        {meta}
      </p>
    </div>
  );
  return href ? (
    <Link
      href={href}
      className="hover:bg-muted/40 -mx-2 block rounded-md px-2 py-2.5 transition-colors"
    >
      {body}
    </Link>
  ) : (
    <div className="-mx-2 px-2 py-2.5">{body}</div>
  );
}

export function Roles({ data }: { data: AnalyticsOverview }) {
  const roles = data.roles;
  const positionMax = Math.max(
    ...roles.positions.map((p) => p.application_count),
    1,
  );
  const roleMax = Math.max(...roles.roles.map((r) => r.application_count), 1);

  return (
    <div className="space-y-3">
      <MetricGrid
        metrics={[
          [
            "Live roles",
            number(roles.published_job_posts),
            `${number(roles.draft_job_posts)} draft · ${number(roles.total_job_posts)} total`,
          ],
          [
            "Positions hiring",
            number(roles.positions.length),
            "received applications this period",
          ],
          [
            "Applications",
            number(data.hiring.total_applications),
            "in this period",
          ],
          [
            "Hire conversion",
            percent(data.hiring.hire_conversion_rate),
            `${number(data.hiring.hires)} hired`,
          ],
        ]}
      />

      <div className="grid gap-3 lg:grid-cols-2">
        <Card size="sm">
          <CardHeader>
            <CardTitle>Top positions</CardTitle>
            <p className="text-muted-foreground mt-1 text-xs">
              Applications by position, across all of its job posts.
            </p>
          </CardHeader>
          <CardContent className="divide-y">
            {roles.positions.length === 0 ? (
              <EmptyMessage message="No positions received applications in this period." />
            ) : (
              roles.positions.map((position) => (
                <RankRow
                  key={position.id}
                  title={position.position_title}
                  badge={
                    position.job_post_count === 1
                      ? "1 post"
                      : `${position.job_post_count} posts`
                  }
                  value={position.application_count}
                  barPct={(position.application_count / positionMax) * 100}
                  meta={`${number(position.active_candidates)} active · ${number(position.hires)} hired · ${percent(position.hire_conversion_rate)} conv.`}
                />
              ))
            )}
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader className="flex flex-row items-start justify-between gap-2">
            <div>
              <CardTitle>Job posts</CardTitle>
              <p className="text-muted-foreground mt-1 text-xs">
                Individual postings by application volume.
              </p>
            </div>
            <Link
              href="/ats/job-posts"
              className="text-muted-foreground hover:text-foreground inline-flex shrink-0 items-center gap-1 text-xs font-medium"
            >
              All <ArrowRight className="size-3" />
            </Link>
          </CardHeader>
          <CardContent className="divide-y">
            {roles.roles.length === 0 ? (
              <EmptyMessage message="No job posts received applications in this period." />
            ) : (
              roles.roles.map((role) => (
                <RankRow
                  key={role.id}
                  href={`/ats/job-posts/${role.id}`}
                  title={role.job_title}
                  badge={JOB_POST_STATUS[role.status].label}
                  subtitle={`${role.position_title} · ${role.location_label}`}
                  value={role.application_count}
                  barPct={(role.application_count / roleMax) * 100}
                  meta={`${number(role.active_candidates)} active · ${number(role.hires)} hired`}
                />
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
