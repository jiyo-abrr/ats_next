"use client";

import Link from "next/link";
import { ArrowLeft, CalendarClock } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Countdown } from "@/components/countdown";
import { ErrorState } from "@/components/states";
import { StatusBadge } from "@/components/status-badge";
import { APPLICATION_STATUS } from "@/lib/constants";
import { formatDate, formatDateTime } from "@/lib/utils/format";
import { useAppSelector } from "@/lib/hooks/redux";
import { useJobPost } from "@/features/job-posts/hooks";
import { useApplication, useApplicationAssessments } from "@/features/applications/hooks";
import { PipelineStepper } from "./_parts/pipeline-stepper";
import { StatusActions } from "./_parts/status-actions";
import { ExtendDeadlineDialog } from "./_parts/extend-deadline-dialog";
import { ResumeDownloadButton } from "./_parts/resume-download-button";
import { ReviewAssessments } from "./_parts/review-assessments";

const DEADLINE_PHASE = new Set(["applied", "disqualified"]);

export function ApplicationReviewDetailView({ id }: { id: string }) {
  const { application: app, loading, error, acting, refetch } =
    useApplication(id);
  const { job } = useJobPost(app?.job_post_id ?? "");
  const { refetch: refetchAssessments } = useApplicationAssessments(id);
  const reviewRow = useAppSelector((s) =>
    s.applications.review.find((r) => r.id === id),
  );

  if (error) {
    return (
      <div>
        <ErrorState message="This application could not be loaded." onRetry={refetch} />
      </div>
    );
  }
  if (loading || !app) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const meta = APPLICATION_STATUS[app.status];
  const applicantName = reviewRow
    ? `${reviewRow.applicant_first_name} ${reviewRow.applicant_last_name}`
    : "Applicant";
  const showDeadline =
    app.assessment_deadline && DEADLINE_PHASE.has(app.status);

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Applications", href: "/ats/applications" },
          { label: applicantName },
        ]}
      />
      <Link
        href="/ats/applications"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="size-4" /> Applications
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {applicantName}
          </h1>
          <p className="text-muted-foreground text-sm">
            {reviewRow?.applicant_email}
            {reviewRow?.applicant_email && job ? " · " : ""}
            {job ? (
              <Link href={`/ats/job-posts/${job.id}`} className="hover:underline">
                {job.job_title}
              </Link>
            ) : null}
          </p>
          <p className="text-muted-foreground text-xs">
            Applied {formatDate(app.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge label={meta.label} tone={meta.tone} />
          <ResumeDownloadButton id={id} applicantName={applicantName} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pipeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <PipelineStepper status={app.status} />
          <StatusActions
            id={id}
            transitions={app.allowed_status_transitions}
            acting={acting}
          />
        </CardContent>
      </Card>

      {showDeadline ? (
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
            <div className="flex items-center gap-3">
              <CalendarClock className="text-muted-foreground size-5" />
              <div>
                <p className="font-medium">
                  Assessment deadline ·{" "}
                  <Countdown target={app.assessment_deadline!} compact />
                </p>
                <p className="text-muted-foreground text-xs">
                  {formatDateTime(app.assessment_deadline)}
                </p>
              </div>
            </div>
            <ExtendDeadlineDialog id={id} onDone={refetchAssessments} />
          </CardContent>
        </Card>
      ) : (
        <div className="flex justify-end">
          <ExtendDeadlineDialog id={id} onDone={refetchAssessments} />
        </div>
      )}

      <ReviewAssessments applicationId={id} />
    </div>
  );
}
