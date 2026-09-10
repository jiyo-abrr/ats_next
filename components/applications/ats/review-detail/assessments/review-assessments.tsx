"use client";

import { useState } from "react";
import { History } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
    <section className="space-y-3">
      <h2 className="text-lg font-medium">Assessments</h2>

      {attempts.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No assessments attached to this role.
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Assessment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Reopens</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attempts.map((a) => {
                  const meta = ATTEMPT_STATUS[a.status];
                  return (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">
                        {TEMPLATE_TYPE_LABELS[a.template_type]}
                      </TableCell>
                      <TableCell>
                        <StatusBadge label={meta.label} tone={meta.tone} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {a.answered_count} / {a.total_questions} answered
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {a.reopens.length > 0 ? (
                          <span className="flex items-center gap-1">
                            <History className="size-3" /> {a.reopens.length}×
                          </span>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {a.status === "expired" ? (
                          <ReopenDialog
                            attemptId={a.id}
                            applicationId={applicationId}
                            onDone={refetch}
                          />
                        ) : null}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {deadline_extensions.length > 0 ? (
        <div className="space-y-2 pt-1">
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
    </section>
  );
}
