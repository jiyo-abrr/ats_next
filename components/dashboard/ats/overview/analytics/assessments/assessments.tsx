"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalyticsOverview, AssessmentTemplateAnalytics, } from "@/features/analytics/schema";
import { TEMPLATE_TYPE_LABELS } from "@/lib/constants";
import { MetricGrid, ProgressRow, minutes, number, percent } from "../primitives";

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
