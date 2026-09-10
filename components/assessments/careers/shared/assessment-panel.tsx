"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, CircleAlert, History } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/status-badge";
import { ATTEMPT_STATUS, TEMPLATE_TYPE_LABELS } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils/format";
import { useApplicationAssessments } from "@/features/applications/hooks";
import type { AssessmentAttempt } from "@/features/assessments/schema";

function AttemptRow({
  attempt,
  applicationId,
}: {
  attempt: AssessmentAttempt;
  applicationId: string;
}) {
  const meta = ATTEMPT_STATUS[attempt.status];
  const actionable =
    attempt.status === "not_started" || attempt.status === "in_progress";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b py-3 last:border-0">
      <div className="space-y-1">
        <p className="text-sm font-medium">
          {TEMPLATE_TYPE_LABELS[attempt.template_type]}
        </p>
        <div className="text-muted-foreground flex items-center gap-2 text-xs">
          <StatusBadge label={meta.label} tone={meta.tone} />
          <span>
            {attempt.answered_count} / {attempt.total_questions} answered
          </span>
          {attempt.reopens.length > 0 ? (
            <span className="flex items-center gap-1">
              <History className="size-3" />
              reopened {attempt.reopens.length}×
            </span>
          ) : null}
        </div>
      </div>
      {actionable ? (
        <Button asChild size="sm">
          <Link
            href={`/applications/${applicationId}/assessments/${attempt.id}`}
          >
            {attempt.status === "not_started" ? "Start" : "Continue"}
            <ArrowRight />
          </Link>
        </Button>
      ) : attempt.status === "completed" ? (
        <span className="text-muted-foreground flex items-center gap-1 text-xs">
          <CheckCircle2 className="size-4 text-emerald-600" /> Submitted
        </span>
      ) : (
        <span className="text-muted-foreground flex items-center gap-1 text-xs">
          <CircleAlert className="size-4 text-red-600" /> Time expired
        </span>
      )}
    </div>
  );
}

export function AssessmentPanel({ applicationId }: { applicationId: string }) {
  const { assessments, loading } = useApplicationAssessments(applicationId);

  if (loading && !assessments) {
    return <Skeleton className="h-40 w-full" />;
  }
  if (!assessments) return null;

  const { attempts, deadline_extensions } = assessments;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assessments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {attempts.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No assessments are required for this role.
          </p>
        ) : (
          <div>
            {attempts.map((a) => (
              <AttemptRow key={a.id} attempt={a} applicationId={applicationId} />
            ))}
          </div>
        )}

        {deadline_extensions.length > 0 ? (
          <div className="space-y-2 border-t pt-3">
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Deadline extensions
            </p>
            {deadline_extensions.map((e) => (
              <div key={e.id} className="text-muted-foreground text-xs">
                → {formatDateTime(e.new_deadline)} · {e.reason} ·{" "}
                {formatDateTime(e.extended_at)}
              </div>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
