"use client";

import Link from "next/link";
import {
  CalendarClock,
  Clock,
  FileText,
  ListChecks,
  Pencil,
  Timer,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ErrorState } from "@/components/states";
import { QUESTION_TYPE_LABELS } from "@/lib/constants";
import type { QuestionType } from "@/lib/types";
import { formatDate } from "@/lib/utils/format";
import { useTemplate } from "@/features/templates/hooks";
import {
  TEMPLATE_KIND_LABELS,
  type TemplateKind,
  questionConfigSummary,
} from "@/features/templates/schema";

export function TemplateView({
  kind,
  id,
}: {
  kind: TemplateKind;
  id: string;
}) {
  const { template, loading, refetch } = useTemplate(kind, id);
  const label = TEMPLATE_KIND_LABELS[kind];

  if (!loading && !template) {
    return (
      <ErrorState
        message="This template could not be loaded."
        onRetry={refetch}
      />
    );
  }
  if (loading || !template) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-44 lg:col-span-2" />
          <Skeleton className="h-44" />
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  const questions = [...template.questions].sort(
    (a, b) => a.order_index - b.order_index,
  );
  const timed = questions.filter((q) => q.time_limit_seconds).length;
  const typeCounts = questions.reduce<Partial<Record<QuestionType, number>>>(
    (acc, q) => ({ ...acc, [q.question_type]: (acc[q.question_type] ?? 0) + 1 }),
    {},
  );
  const editHref = `/ats/templates/${kind}/${id}/edit`;

  return (
    <div className="space-y-3">
      <Breadcrumbs
        items={[
          { label: `${label} templates`, href: `/ats/templates/${kind}` },
          { label: template.title },
        ]}
      />
      <div className="grid items-start gap-3 xl:grid-cols-12">
        <Card size="sm" className="xl:col-span-8">
          <CardContent className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 space-y-1.5">
              <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
                <FileText className="size-3.5" />
                {label} template
              </div>
              <h1 className="truncate text-2xl font-semibold tracking-tight">
                {template.title}
              </h1>
              <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
                <CalendarClock className="size-3.5" />
                Updated {formatDate(template.updated_at)}
              </p>
            </div>
            <Button asChild size="sm" className="shrink-0">
              <Link href={editHref}>
                <Pencil /> Edit
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card size="sm" className="xl:col-span-4">
          <CardContent className="grid grid-cols-3 divide-x">
            <TemplateMetric
              label="Questions"
              value={questions.length}
              icon={ListChecks}
            />
            <TemplateMetric
              label="Attempt"
              value={template.time_limit_minutes ?? "—"}
              hint={template.time_limit_minutes ? "minutes" : "no limit"}
              icon={Clock}
            />
            <TemplateMetric
              label="Timed"
              value={timed}
              hint="questions"
              icon={Timer}
            />
          </CardContent>
        </Card>

        <Card size="sm" className="xl:col-span-5">
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5">
              <FileText className="text-muted-foreground size-4" />
              Description
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-6">
            {template.description ? (
              <p className="whitespace-pre-wrap">{template.description}</p>
            ) : (
              <p className="text-muted-foreground italic">
                No internal description.
              </p>
            )}
          </CardContent>
        </Card>

        <Card size="sm" className="xl:col-span-7">
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5">
              <ListChecks className="text-muted-foreground size-4" />
              Applicant instructions
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-6">
            {template.instructions ? (
              <p className="whitespace-pre-wrap">{template.instructions}</p>
            ) : (
              <p className="text-muted-foreground italic">
                None set — applicants see only the questions.
              </p>
            )}
          </CardContent>
        </Card>

        <Card size="sm" className="xl:col-span-12">
          <CardHeader className="gap-2 sm:flex sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-1.5">
              <ListChecks className="text-muted-foreground size-4" />
              Questions
              <span className="text-muted-foreground font-normal">
                ({questions.length})
              </span>
            </CardTitle>
            {questions.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(typeCounts).map(([t, n]) => (
                  <Badge key={t} variant="secondary" className="font-normal">
                    {QUESTION_TYPE_LABELS[t as QuestionType]} · {n}
                  </Badge>
                ))}
              </div>
            ) : null}
          </CardHeader>
          <CardContent>
            {questions.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No questions yet.{" "}
                <Link href={editHref} className="underline">
                  Add some
                </Link>
                .
              </p>
            ) : (
              <ol className="overflow-hidden rounded-lg border divide-y">
                {questions.map((q, i) => {
                  const config = questionConfigSummary(q);

                  return (
                    <li
                      key={q.id}
                      className="grid gap-2 p-3 sm:grid-cols-[1.75rem_minmax(0,1fr)_auto] sm:items-start"
                    >
                      <span className="bg-muted text-muted-foreground grid size-7 place-items-center rounded-md text-xs font-medium tabular-nums">
                        {i + 1}
                      </span>
                      <div className="min-w-0 space-y-1.5">
                        <p className="text-sm font-medium leading-5">
                          {q.prompt}
                        </p>
                        {config.length > 0 ? (
                          <p className="text-muted-foreground text-xs leading-5">
                            {config.join(" · ")}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 sm:justify-end">
                        <Badge variant="secondary" className="font-normal">
                          {QUESTION_TYPE_LABELS[q.question_type]}
                        </Badge>
                        {q.time_limit_seconds ? (
                          <Badge variant="outline" className="font-normal">
                            <Timer className="size-3" />
                            {q.time_limit_seconds}s
                          </Badge>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function TemplateMetric({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="min-w-0 space-y-1 px-3 first:pl-0 last:pr-0">
      <div className="text-muted-foreground flex items-center gap-1 text-[11px] font-medium leading-4">
        <Icon className="size-3.5 shrink-0" />
        <span className="truncate">{label}</span>
      </div>
      <p className="text-xl leading-5 font-semibold tracking-tight">{value}</p>
      {hint ? (
        <p className="text-muted-foreground truncate text-[11px] leading-4">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
