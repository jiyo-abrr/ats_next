"use client";

import Link from "next/link";
import { ArrowLeft, Clock, ListChecks, Pencil, Timer } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ErrorState } from "@/components/states";
import { StatCard } from "@/components/stat-card";
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
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: `${label} templates`, href: `/ats/templates/${kind}` },
          { label: template.title },
        ]}
      />
      <Link
        href={`/ats/templates/${kind}`}
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="size-4" /> {label} templates
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {template.title}
          </h1>
          <p className="text-muted-foreground text-sm">
            {label} template · updated {formatDate(template.updated_at)}
          </p>
        </div>
        <Button asChild size="sm">
          <Link href={editHref}>
            <Pencil /> Edit
          </Link>
        </Button>
      </div>

      {/* Content (left) + metrics (right) */}
      <div className="grid items-start gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              {template.description ? (
                <p className="whitespace-pre-wrap">{template.description}</p>
              ) : (
                <p className="text-muted-foreground italic">
                  No description (internal note only).
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Applicant instructions</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              {template.instructions ? (
                <p className="whitespace-pre-wrap">{template.instructions}</p>
              ) : (
                <p className="text-muted-foreground italic">
                  None set — applicants see only the questions.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
          <StatCard
            label="Questions"
            value={questions.length}
            icon={ListChecks}
          />
          <StatCard
            label="Attempt timer"
            value={template.time_limit_minutes ?? "—"}
            hint={
              template.time_limit_minutes ? "minutes" : "no overall limit"
            }
            icon={Clock}
          />
          <StatCard
            label="Timed questions"
            value={timed}
            hint="with a per-question clock"
            icon={Timer}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-1.5">
            <ListChecks className="text-muted-foreground size-4" />
            Questions ({questions.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {questions.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No questions yet.{" "}
              <Link href={editHref} className="underline">
                Add some
              </Link>
              .
            </p>
          ) : (
            <>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(typeCounts).map(([t, n]) => (
                  <Badge key={t} variant="secondary" className="font-normal">
                    {QUESTION_TYPE_LABELS[t as QuestionType]} · {n}
                  </Badge>
                ))}
              </div>
              <ol className="space-y-2">
                {questions.map((q, i) => (
                  <li
                    key={q.id}
                    className="flex items-start gap-3 rounded-lg border p-3"
                  >
                    <span className="text-muted-foreground w-5 shrink-0 pt-0.5 text-right text-sm tabular-nums">
                      {i + 1}.
                    </span>
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="text-sm font-medium">{q.prompt}</p>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge variant="secondary" className="font-normal">
                          {QUESTION_TYPE_LABELS[q.question_type]}
                        </Badge>
                        {q.time_limit_seconds ? (
                          <Badge variant="outline" className="font-normal">
                            {q.time_limit_seconds}s
                          </Badge>
                        ) : null}
                      </div>
                      {questionConfigSummary(q).map((s, j) => (
                        <p key={j} className="text-muted-foreground text-xs">
                          {s}
                        </p>
                      ))}
                    </div>
                  </li>
                ))}
              </ol>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
