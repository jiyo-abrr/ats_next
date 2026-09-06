"use client";

import { useState } from "react";
import { History } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/status-badge";
import { ATTEMPT_STATUS, TEMPLATE_TYPE_LABELS } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils/format";
import { useAppDispatch } from "@/lib/hooks/redux";
import { toast } from "@/lib/utils/toast";
import { reopenAssessmentAttempt } from "@/lib/store/applicationsSlice";
import { useApplicationAssessments } from "@/features/applications/hooks";

function ReopenDialog({
  attemptId,
  applicationId,
  onDone,
}: {
  attemptId: string;
  applicationId: string;
  onDone: () => void;
}) {
  const dispatch = useAppDispatch();
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      await dispatch(
        reopenAssessmentAttempt({ attemptId, reason, applicationId }),
      ).unwrap();
      toast.success("Attempt reopened");
      onDone();
    } catch {
      /* handled */
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Reopen
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reopen this attempt</DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground text-sm">
          Existing answers are kept as history; the applicant restarts from the
          first question.
        </p>
        <Textarea
          placeholder="Reason (required)"
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button disabled={!reason.trim() || busy} onClick={submit}>
              {busy ? "Reopening…" : "Reopen"}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ReviewAssessments({ applicationId }: { applicationId: string }) {
  const { assessments, loading, refetch } =
    useApplicationAssessments(applicationId);

  if (loading && !assessments) return <Skeleton className="h-40 w-full" />;
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
            No assessments attached to this role.
          </p>
        ) : (
          <div>
            {attempts.map((a) => {
              const meta = ATTEMPT_STATUS[a.status];
              return (
                <div
                  key={a.id}
                  className="flex flex-wrap items-center justify-between gap-3 border-b py-3 last:border-0"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {TEMPLATE_TYPE_LABELS[a.template_type]} assessment
                    </p>
                    <div className="text-muted-foreground flex items-center gap-2 text-xs">
                      <StatusBadge label={meta.label} tone={meta.tone} />
                      <span>
                        {a.answered_count} / {a.total_questions} answered
                      </span>
                      {a.reopens.length > 0 ? (
                        <span className="flex items-center gap-1">
                          <History className="size-3" /> {a.reopens.length}×
                        </span>
                      ) : null}
                    </div>
                  </div>
                  {a.status === "expired" ? (
                    <ReopenDialog
                      attemptId={a.id}
                      applicationId={applicationId}
                      onDone={refetch}
                    />
                  ) : null}
                </div>
              );
            })}
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
