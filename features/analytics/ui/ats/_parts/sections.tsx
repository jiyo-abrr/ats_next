"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, Clock3 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  APPLICATION_STATUS,
  JOB_POST_STATUS,
  TEMPLATE_TYPE_LABELS,
} from "@/lib/constants";
import { cn } from "@/lib/cn";
import { WorkQueueTiles } from "@/features/dashboard/ui/ats/work-queue-tiles";
import type {
  AnalyticsOverview,
  AssessmentTemplateAnalytics,
} from "@/features/analytics/schema";
import {
  ActivityBars,
  EmptyMessage,
  MetricGrid,
  ProgressRow,
  StatusBars,
  minutes,
  number,
  percent,
  statusCount,
} from "./primitives";

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

const dimensionLabels: Record<string, string> = {
  relevant_work_experience: "Relevant work experience",
  industry_experience: "Industry experience",
  employment_gap: "Employment gaps",
  tenure_stability: "Tenure stability",
  career_progression: "Career progression",
  job_hopping_risk: "Job-hopping risk",
  educational_background: "Education",
  certifications_licenses: "Certifications & licenses",
  technical_skills_match: "Technical skills match",
  pre_assessment: "Pre-assessment",
  culture_fit: "Culture fit",
  technical: "Technical assessment",
};

// Aligns with the Compare tab's rating vocabulary.
const RATING_STYLE = {
  strong: { label: "Strong", bar: "bg-emerald-500" },
  qualified: { label: "Qualified", bar: "bg-amber-500" },
  below_bar: { label: "Below bar", bar: "bg-red-500" },
  na: { label: "N/A", bar: "bg-muted-foreground/25" },
} as const;

const RECOMMENDATION_ROWS = [
  { key: "advance", label: "Advance", bar: "bg-emerald-500" },
  { key: "hold", label: "Hold", bar: "bg-amber-500" },
  { key: "reject", label: "Reject", bar: "bg-red-500" },
] as const;

const fitBandLabels: Record<string, string> = {
  "0-49": "0–49",
  "50-69": "50–69",
  "70-84": "70–84",
  "85-100": "85–100",
};

/** A single proportional bar built from labelled segments. */
function StackedBar({
  segments,
}: {
  segments: { value: number; className: string; label: string }[];
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  return (
    <div className="bg-muted flex h-2.5 w-full overflow-hidden rounded-full">
      {total > 0 &&
        segments.map((seg) =>
          seg.value ? (
            <div
              key={seg.label}
              className={cn("h-full", seg.className)}
              style={{ width: `${(seg.value / total) * 100}%` }}
              title={`${seg.label}: ${seg.value}`}
            />
          ) : null,
        )}
    </div>
  );
}

/** Legend for the dimension-rating columns. */
function RatingLegend() {
  return (
    <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
      <span className="flex items-center gap-1.5">
        <span className="bg-emerald-500 size-2 rounded-full" />
        Strong
      </span>
      <span className="flex items-center gap-1.5">
        <span className="bg-amber-500 size-2 rounded-full" />
        Qualified
      </span>
      <span className="flex items-center gap-1.5">
        <span className="bg-red-500 size-2 rounded-full" />
        Below bar
      </span>
    </div>
  );
}

/** Weighted lean of a dimension, for sorting strongest-first. */
function dimensionLean(d: {
  strong: number;
  qualified: number;
  below_bar: number;
}) {
  const rated = d.strong + d.qualified + d.below_bar;
  if (!rated) return -Infinity;
  return (d.strong + d.qualified * 0.5 - d.below_bar) / rated;
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

export function Hiring({ data }: { data: AnalyticsOverview }) {
  const hiring = data.hiring;
  return (
    <div className="grid items-start gap-3 xl:grid-cols-12">
      <MetricGrid
        className="xl:col-span-12"
        metrics={[
          [
            "Applications",
            number(hiring.total_applications),
            "received in this period",
          ],
          [
            "Unique applicants",
            number(hiring.unique_applicants),
            "distinct people",
          ],
          [
            "Active candidates",
            number(hiring.active_candidates),
            "in active stages",
          ],
          [
            "Hire conversion",
            percent(hiring.hire_conversion_rate),
            `${number(hiring.hires)} hires`,
          ],
        ]}
      />
      <Card size="sm" className="xl:col-span-7">
        <CardHeader>
          <CardTitle>Application volume</CardTitle>
          <p className="text-muted-foreground text-xs">
            Applications received over the selected period.
          </p>
        </CardHeader>
        <CardContent>
          <ActivityBars points={hiring.application_activity} />
        </CardContent>
      </Card>
      <Card size="sm" className="xl:col-span-5">
        <CardHeader>
          <CardTitle>Pipeline distribution</CardTitle>
          <p className="text-muted-foreground text-xs">
            Every current application status.
          </p>
        </CardHeader>
        <CardContent>
          <StatusBars
            counts={hiring.by_status}
            total={hiring.total_applications}
          />
        </CardContent>
      </Card>
      <Card size="sm" className="xl:col-span-12">
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-muted grid size-9 place-items-center rounded-lg">
              <Clock3 className="text-muted-foreground size-4" />
            </div>
            <div>
              <p className="text-sm font-medium">Assessment deadlines</p>
              <p className="text-muted-foreground text-xs">
                {number(hiring.overdue_assessments)} active application
                {hiring.overdue_assessments === 1 ? "" : "s"} past the assessment
                deadline.
              </p>
            </div>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link href="/ats/applications">
              Review applications <ArrowUpRight />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

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

export function Assessments({ data }: { data: AnalyticsOverview }) {
  const assessments = data.assessments;
  const inProgress =
    assessments.started_attempts -
    assessments.completed_attempts -
    assessments.expired_attempts;
  return (
    <div className="grid items-start gap-3 xl:grid-cols-12">
      <MetricGrid
        className="xl:col-span-12"
        metrics={[
          [
            "Attempts issued",
            number(assessments.total_attempts),
            `${number(assessments.started_attempts)} started`,
          ],
          [
            "Completion (of started)",
            percent(assessments.started_completion_rate),
            `${number(assessments.completed_attempts)} completed`,
          ],
          [
            "Completion (of issued)",
            percent(assessments.completion_rate),
            "includes not-yet-started",
          ],
          [
            "Average time",
            minutes(assessments.average_completion_minutes),
            `${number(assessments.reopen_count)} reopened`,
          ],
        ]}
      />
      <Card size="sm" className="xl:col-span-8">
        <CardHeader>
          <CardTitle>Performance by assessment</CardTitle>
          <p className="text-muted-foreground text-xs">
            Completion (of started) and recovery patterns by template type.
          </p>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {assessments.templates.map((template) => (
            <AssessmentCard key={template.template_type} template={template} />
          ))}
        </CardContent>
      </Card>
      <Card size="sm" className="xl:col-span-4">
        <CardHeader>
          <CardTitle>Attempt outcomes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ProgressRow
            label="Completed"
            value={assessments.completed_attempts}
            total={assessments.started_attempts}
          />
          <ProgressRow
            label="In progress"
            value={inProgress > 0 ? inProgress : 0}
            total={assessments.started_attempts}
          />
          <ProgressRow
            label="Expired"
            value={assessments.expired_attempts}
            total={assessments.started_attempts}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function AssessmentCard({
  template,
}: {
  template: AssessmentTemplateAnalytics;
}) {
  const started = template.attempts - template.not_started;
  return (
    <div className="bg-muted/40 space-y-3 rounded-lg border p-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium">
          {TEMPLATE_TYPE_LABELS[template.template_type]}
        </p>
        <span className="text-muted-foreground text-xs tabular-nums">
          {number(template.attempts)} attempts
        </span>
      </div>
      <ProgressRow label="Completed" value={template.completed} total={started} />
      <div className="text-muted-foreground grid grid-cols-2 gap-2 text-xs">
        <span>{number(template.expired)} expired</span>
        <span className="text-right">
          {minutes(template.average_completion_minutes)} avg.
        </span>
      </div>
    </div>
  );
}

export function Evaluations({ data }: { data: AnalyticsOverview }) {
  const evaluations = data.evaluations;
  const evaluated = evaluations.evaluated_applications;
  const advance = statusCount(evaluations.recommendations, "advance");
  const resumeDimensions = evaluations.score_dimensions.filter(
    (d) => d.category === "resume",
  );
  const assessmentDimensions = evaluations.score_dimensions.filter(
    (d) => d.category === "assessment",
  );

  if (evaluated === 0) {
    return (
      <Card size="sm">
        <CardContent className="py-10 text-center">
          <p className="text-sm font-medium">No evaluations yet</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Export an evaluation pack from a job post&apos;s Compare tab, run it
            through the AI, then import the results.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <MetricGrid
        metrics={[
          [
            "Evaluated",
            number(evaluated),
            `${percent(evaluations.evaluation_coverage_rate)} of all applications`,
          ],
          [
            "Average fit",
            evaluations.average_fit_score?.toFixed(1) ?? "—",
            "out of 100",
          ],
          [
            "Advance rate",
            percent(evaluated ? (advance / evaluated) * 100 : 0),
            `${number(advance)} of ${number(evaluated)}`,
          ],
          [
            "Imported",
            number(
              evaluations.evaluation_activity.reduce(
                (sum, point) => sum + point.count,
                0,
              ),
            ),
            "in this period",
          ],
        ]}
      />

      <div className="grid gap-3 lg:grid-cols-2">
        <Card size="sm">
          <CardHeader>
            <CardTitle>Recommendation mix</CardTitle>
            <p className="text-muted-foreground text-xs">
              Latest AI recommendation per application.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <StackedBar
              segments={RECOMMENDATION_ROWS.map((row) => ({
                value: statusCount(evaluations.recommendations, row.key),
                className: row.bar,
                label: row.label,
              }))}
            />
            <div className="space-y-2.5">
              {RECOMMENDATION_ROWS.map((row) => {
                const count = statusCount(evaluations.recommendations, row.key);
                const pct = evaluated ? (count / evaluated) * 100 : 0;
                return (
                  <div key={row.key} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5">
                        <span
                          className={cn("size-2 rounded-full", row.bar)}
                        />
                        {row.label}
                      </span>
                      <span className="tabular-nums">
                        <span className="font-medium">{number(count)}</span>
                        <span className="text-muted-foreground">
                          {" "}
                          &middot; {percent(pct)}
                        </span>
                      </span>
                    </div>
                    <div className="bg-muted h-1.5 overflow-hidden rounded-full">
                      <div
                        className={cn("h-full rounded-full", row.bar)}
                        style={{
                          width: `${Math.max(pct, count ? 4 : 0)}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardTitle>Fit-score distribution</CardTitle>
            <p className="text-muted-foreground text-xs">
              Latest score for each evaluated application.
            </p>
          </CardHeader>
          <CardContent>
            <StatusBars
              counts={evaluations.fit_score_bands}
              total={evaluated}
              labels={fitBandLabels}
            />
          </CardContent>
        </Card>
      </div>

      <Card size="sm">
        <CardHeader className="gap-2">
          <CardTitle>Dimension ratings</CardTitle>
          <p className="text-muted-foreground text-xs">
            Applicants at each rating per dimension, ordered strongest first.
            N/A ratings are left out, so a group may not sum to{" "}
            {number(evaluated)}.
          </p>
          <RatingLegend />
        </CardHeader>
        <CardContent className="space-y-5">
          {evaluations.score_dimensions.length === 0 ? (
            <EmptyMessage message="The imported evaluations have no dimension scores." />
          ) : (
            <>
              <DimensionGroup
                title="Résumé"
                dimensions={resumeDimensions}
                max={evaluated}
              />
              <DimensionGroup
                title="Assessments"
                dimensions={assessmentDimensions}
                max={evaluated}
              />
              <p className="text-muted-foreground border-t pt-3 text-xs">
                <span className="text-foreground font-medium">Basis:</span>{" "}
                the latest AI evaluation imported for each of the{" "}
                {number(evaluated)} evaluated applicant
                {evaluated === 1 ? "" : "s"} — résumé rubric and assessment
                answers scored as Strong / Qualified / Below bar by the external
                AI on the Compare tab, then imported as CSV. Counts are
                all-time and follow the position filter above.
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader>
          <CardTitle>Evaluation activity</CardTitle>
          <p className="text-muted-foreground text-xs">
            Evaluations imported during the selected period.
          </p>
        </CardHeader>
        <CardContent>
          <ActivityBars points={evaluations.evaluation_activity} compact />
        </CardContent>
      </Card>
    </div>
  );
}

/** Evenly-spaced integer axis ticks from 0 up to (and including) max. */
function axisTicks(max: number): number[] {
  const top = Math.max(1, max);
  const step = top <= 6 ? 1 : Math.ceil(top / 4);
  const out: number[] = [];
  for (let value = 0; value <= top; value += step) out.push(value);
  if (out[out.length - 1] !== top) out.push(top);
  return out;
}

function DimensionGroup({
  title,
  dimensions,
  max,
}: {
  title: string;
  dimensions: AnalyticsOverview["evaluations"]["score_dimensions"];
  max: number;
}) {
  if (dimensions.length === 0) return null;
  const sorted = [...dimensions].sort(
    (a, b) => dimensionLean(b) - dimensionLean(a),
  );
  const top = Math.max(1, max);
  const ticks = axisTicks(max);
  const PLOT_H = 148;
  const CLUSTER_W = 76;
  const GAP = 20;

  return (
    <div className="space-y-2">
      <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        {title}
      </p>
      <div className="flex gap-2 pt-2">
        <div
          className="relative w-4 shrink-0"
          style={{ height: PLOT_H }}
          aria-hidden
        >
          {ticks.map((tick) => (
            <span
              key={tick}
              className="text-muted-foreground absolute right-0 -translate-y-1/2 text-[10px] leading-none tabular-nums"
              style={{ bottom: `${(tick / top) * 100}%` }}
            >
              {tick}
            </span>
          ))}
        </div>
        <div className="min-w-0 flex-1 overflow-x-auto pb-1">
          <div
            className="relative w-max"
            style={{ height: PLOT_H, minWidth: "100%" }}
          >
            {ticks.map((tick) => (
              <span
                key={tick}
                aria-hidden
                className={cn(
                  "absolute inset-x-0 border-t",
                  tick === 0 ? "border-border" : "border-border/50",
                )}
                style={{ bottom: `${(tick / top) * 100}%` }}
              />
            ))}
            <div
              className="absolute inset-0 flex items-end"
              style={{ gap: GAP }}
            >
              {sorted.map((dimension) => (
                <DimensionCluster
                  key={`${dimension.category}-${dimension.dimension}`}
                  {...dimension}
                  max={top}
                  width={CLUSTER_W}
                />
              ))}
            </div>
          </div>
          <div
            className="mt-1.5 flex w-max"
            style={{ gap: GAP, minWidth: "100%" }}
          >
            {sorted.map((dimension) => (
              <span
                key={`${dimension.category}-${dimension.dimension}`}
                className="text-muted-foreground shrink-0 text-center text-[10px] leading-tight capitalize"
                style={{ width: CLUSTER_W }}
              >
                {dimensionLabels[dimension.dimension] ??
                  dimension.dimension.replaceAll("_", " ")}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * One dimension as a cluster of up to three bars — strong (emerald), qualified
 * (amber), below bar (red) — sharing the group's y-axis. Bars with a zero
 * count are dropped; N/A is omitted entirely.
 */
function DimensionCluster({
  dimension,
  strong,
  qualified,
  below_bar,
  na,
  max,
  width,
}: {
  category: string;
  dimension: string;
  strong: number;
  qualified: number;
  below_bar: number;
  na: number;
  max: number;
  width: number;
}) {
  const label = dimensionLabels[dimension] ?? dimension.replaceAll("_", " ");
  const bars = [
    { key: "strong", value: strong, className: RATING_STYLE.strong.bar },
    { key: "qualified", value: qualified, className: RATING_STYLE.qualified.bar },
    { key: "below_bar", value: below_bar, className: RATING_STYLE.below_bar.bar },
  ].filter((bar) => bar.value > 0);

  return (
    <div
      className="flex h-full shrink-0 items-end justify-center gap-1.5"
      style={{ width }}
      title={`${label} — ${strong} strong · ${qualified} qualified · ${below_bar} below bar${
        na ? ` · ${na} N/A` : ""
      }`}
    >
      {bars.length === 0 ? (
        <span className="text-muted-foreground/60 pb-1 text-[10px]">—</span>
      ) : (
        bars.map((bar) => (
          <div
            key={bar.key}
            className={cn("w-5 rounded-t-sm", bar.className)}
            style={{ height: `${(bar.value / max) * 100}%`, minHeight: "3px" }}
          />
        ))
      )}
    </div>
  );
}
