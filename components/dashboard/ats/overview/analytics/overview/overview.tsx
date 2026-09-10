"use client";

import { WorkQueueTiles } from "@/components/dashboard/ats/overview/shared/work-queue-tiles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalyticsOverview } from "@/features/analytics/schema";
import { APPLICATION_STATUS, TEMPLATE_TYPE_LABELS } from "@/lib/constants";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ActivityBars, EmptyMessage, ProgressRow, StatusBars, number, percent, statusCount } from "../primitives";

/** A card that is itself a link into one analytics section. */
function SectionCard({
  title,
  href,
  footer,
  children,
}: {
  title: string;
  href: string;
  footer?: string;
  children: React.ReactNode;
}) {
  return (
    <Card size="sm" className="hover:border-foreground/20 transition-colors">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <Link
          href={href}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs font-medium"
        >
          Details <ArrowRight className="size-3" />
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">{children}</CardContent>
      {footer ? (
        <CardContent className="text-muted-foreground pt-0 text-xs">
          {footer}
        </CardContent>
      ) : null}
    </Card>
  );
}

const FUNNEL_STAGES = [
  { status: "applied", href: "/ats/applications?f_status=applied" },
  { status: "prescreening", href: "/ats/applications?f_status=prescreening" },
  { status: "interview", href: "/ats/applications?f_status=interview" },
  { status: "success", href: "/ats/applications?f_status=success" },
] as const;

export function Overview({ data }: { data: AnalyticsOverview }) {
  const withPeriod = (href: string) => `${href}&period=${data.period}`;
  const stageCount = (status: string) =>
    statusCount(data.hiring.by_status, status);
  const funnelMax = Math.max(
    ...FUNNEL_STAGES.map((s) => stageCount(s.status)),
    1,
  );
  const topRoles = data.roles.roles.slice(0, 4);

  return (
    <div className="space-y-3">
      <WorkQueueTiles
        counts={{
          applied: stageCount("applied"),
          prescreening: stageCount("prescreening"),
          interview: stageCount("interview"),
          draft: data.roles.draft_job_posts,
        }}
      />

      {/* Pipeline funnel — each stage links to its filtered list */}
      <Card size="sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Hiring pipeline</CardTitle>
            <p className="text-muted-foreground mt-1 text-xs">
              {number(data.hiring.total_applications)} applications ·{" "}
              {percent(data.hiring.hire_conversion_rate)} reach a hire
            </p>
          </div>
          <Link
            href={withPeriod("/ats?view=hiring")}
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs font-medium"
          >
            Details <ArrowRight className="size-3" />
          </Link>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {FUNNEL_STAGES.map((stage, i) => {
              const count = stageCount(stage.status);
              const meta = APPLICATION_STATUS[stage.status];
              return (
                <Link
                  key={stage.status}
                  href={stage.href}
                  className="hover:bg-muted/50 group flex flex-col gap-1.5 rounded-lg border p-3 transition-colors"
                >
                  <span className="text-muted-foreground flex items-center gap-1 text-xs">
                    {i > 0 ? <ArrowRight className="size-3" /> : null}
                    {meta.label}
                  </span>
                  <span className="text-2xl font-semibold tabular-nums">
                    {number(count)}
                  </span>
                  <span
                    className="bg-muted h-1.5 overflow-hidden rounded-full"
                    aria-hidden
                  >
                    <span
                      className="bg-primary block h-full rounded-full"
                      style={{
                        width: `${Math.max((count / funnelMax) * 100, count ? 6 : 0)}%`,
                      }}
                    />
                  </span>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 lg:grid-cols-2">
        <SectionCard
          title="Application volume"
          href={withPeriod("/ats?view=hiring")}
          footer={`${number(data.hiring.unique_applicants)} unique applicants in this period`}
        >
          <ActivityBars points={data.hiring.application_activity} compact />
        </SectionCard>

        <SectionCard
          title="AI evaluations"
          href={withPeriod("/ats?view=evaluations")}
          footer={
            data.evaluations.evaluated_applications > 0
              ? `${percent(data.evaluations.evaluation_coverage_rate)} coverage · ${data.evaluations.average_fit_score?.toFixed(1) ?? "—"} avg. fit score`
              : "No evaluations imported yet."
          }
        >
          {data.evaluations.evaluated_applications > 0 ? (
            <StatusBars
              counts={data.evaluations.recommendations}
              total={data.evaluations.evaluated_applications}
              labels={{ advance: "Advance", hold: "Hold", reject: "Reject" }}
            />
          ) : (
            <EmptyMessage message="Import an evaluation pack from the Compare tab." />
          )}
        </SectionCard>

        <SectionCard
          title="Assessment completion"
          href={withPeriod("/ats?view=assessments")}
          footer={`${percent(data.assessments.started_completion_rate)} of started attempts completed · ${number(data.assessments.reopen_count)} reopened`}
        >
          {data.assessments.templates.every((t) => t.attempts === 0) ? (
            <EmptyMessage message="No assessment attempts yet." />
          ) : (
            data.assessments.templates.map((template) => (
              <ProgressRow
                key={template.template_type}
                label={TEMPLATE_TYPE_LABELS[template.template_type]}
                value={template.completed}
                total={Math.max(template.attempts - template.not_started, 0)}
              />
            ))
          )}
        </SectionCard>

        <SectionCard
          title="Top roles"
          href={withPeriod("/ats?view=roles")}
          footer={`${number(data.roles.published_job_posts)} live · ${number(data.roles.draft_job_posts)} draft · ${number(data.roles.total_job_posts)} total`}
        >
          {topRoles.length === 0 ? (
            <EmptyMessage message="No roles received applications in this period." />
          ) : (
            <div className="divide-y">
              {topRoles.map((role) => (
                <Link
                  key={role.id}
                  href={`/ats/job-posts/${role.id}`}
                  className="hover:bg-muted/50 -mx-2 flex items-center justify-between gap-3 rounded-md px-2 py-2 transition-colors"
                >
                  <span className="min-w-0 truncate text-sm">
                    {role.job_title}
                  </span>
                  <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                    {number(role.application_count)} applied ·{" "}
                    {number(role.hires)} hired
                  </span>
                </Link>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
