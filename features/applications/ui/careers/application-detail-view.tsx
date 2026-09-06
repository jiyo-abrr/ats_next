"use client";

import Link from "next/link";
import { ArrowLeft, CalendarClock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Countdown } from "@/components/countdown";
import { ErrorState } from "@/components/states";
import { StatusBadge } from "@/components/status-badge";
import { AssessmentPanel } from "@/features/assessments/ui/careers/assessment-panel";
import { useJobPost } from "@/features/job-posts/hooks";
import { APPLICATION_STATUS } from "@/lib/constants";
import { formatDate, formatDateTime } from "@/lib/utils/format";
import { useAppDispatch } from "@/lib/hooks/redux";
import { toast } from "@/lib/utils/toast";
import { withdrawApplication } from "@/lib/store/applicationsSlice";
import { useApplication } from "@/features/applications/hooks";

const ASSESSMENT_PHASE = new Set(["applied", "disqualified"]);

export function ApplicationDetailView({ id }: { id: string }) {
  const dispatch = useAppDispatch();
  const { application: app, loading, error, acting, refetch } =
    useApplication(id);
  const { job } = useJobPost(app?.job_post_id ?? "");

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <ErrorState message="This application could not be loaded." onRetry={refetch} />
      </div>
    );
  }
  if (loading || !app) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-10">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const meta = APPLICATION_STATUS[app.status];
  const showDeadline =
    app.assessment_deadline && ASSESSMENT_PHASE.has(app.status);

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <Breadcrumbs
        items={[
          { label: "My applications", href: "/applications" },
          { label: job?.job_title ?? "Application" },
        ]}
      />

      <Link
        href="/applications"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="size-4" /> Back
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {job ? (
              <Link href={`/jobs/${job.id}`} className="hover:underline">
                {job.job_title}
              </Link>
            ) : (
              "Application"
            )}
          </h1>
          <p className="text-muted-foreground text-sm">
            Applied {formatDate(app.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge label={meta.label} tone={meta.tone} />
          {app.can_withdraw ? (
            <ConfirmDialog
              trigger={
                <Button variant="outline" size="sm" disabled={acting}>
                  Withdraw
                </Button>
              }
              title="Withdraw this application?"
              description="This can't be undone. You'd need to re-apply from scratch."
              destructive
              confirmLabel="Withdraw"
              onConfirm={async () => {
                try {
                  await dispatch(withdrawApplication(id)).unwrap();
                  toast.success("Application withdrawn");
                } catch {
                  /* handled */
                }
              }}
            />
          ) : null}
        </div>
      </div>

      {showDeadline ? (
        <Card>
          <CardContent className="flex items-center gap-3 p-4 text-sm">
            <CalendarClock className="text-muted-foreground size-5" />
            <div>
              <p className="font-medium">
                Assessment deadline ·{" "}
                <Countdown target={app.assessment_deadline!} compact />
              </p>
              <p className="text-muted-foreground text-xs">
                Complete all assessments by{" "}
                {formatDateTime(app.assessment_deadline)}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <AssessmentPanel applicationId={id} />

      <Card>
        <CardHeader>
          <CardTitle>What happens next</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
          {app.status === "applied" &&
            "Complete any required assessments above. Once submitted, your application moves to prescreening review."}
          {app.status === "prescreening" &&
            "Your application is being screened by the hiring team."}
          {app.status === "interview" && "You're in the interview stage."}
          {app.status === "success" && "You've been selected — congratulations!"}
          {(app.status === "denied" || app.status === "failed") &&
            "This application wasn't successful this time."}
          {app.status === "disqualified" &&
            "This application was disqualified for a missed assessment deadline. The hiring team can reinstate it by extending the deadline."}
          {app.status === "withdrawn" && "You withdrew this application."}
        </CardContent>
      </Card>
    </div>
  );
}
