"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { ConfirmDialog } from "@/components/confirm-dialog";
import * as applicationsService from "@/features/applications/applicationsService";
import type { ApplicationSummary } from "@/features/applications/schema";
import { submitApplication } from "@/lib/store/applicationsSlice";
import { APPLICATION_STATUS } from "@/lib/constants";
import { useCurrentUser } from "@/features/auth/hooks";
import { useAppDispatch } from "@/lib/hooks/redux";
import { toast } from "@/lib/utils/toast";

export function ApplyButton({ jobId }: { jobId: string }) {
  const user = useCurrentUser();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const isApplicant = user?.role === "applicant";

  // undefined = not yet checked, null = no active application, else the app
  const [existing, setExisting] = useState<
    ApplicationSummary | null | undefined
  >(undefined);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isApplicant) return;
    let active = true;
    applicationsService
      .listMine(`job_post_id=${jobId}&size=1`)
      .then((res) => {
        if (active) {
          setExisting(res.items.find((a) => a.status !== "withdrawn") ?? null);
        }
      })
      .catch(() => {
        if (active) setExisting(null);
      });
    return () => {
      active = false;
    };
  }, [isApplicant, jobId]);

  if (!user) {
    return (
      <Button asChild size="lg">
        <Link href={`/login?next=${encodeURIComponent(`/jobs/${jobId}`)}`}>
          Sign in to apply
        </Link>
      </Button>
    );
  }

  if (!isApplicant) {
    return (
      <p className="text-muted-foreground text-sm">
        Staff accounts can&apos;t submit applications.
      </p>
    );
  }

  if (existing === undefined) {
    return (
      <Button size="lg" disabled>
        Checking…
      </Button>
    );
  }

  if (existing) {
    const meta = APPLICATION_STATUS[existing.status];
    return (
      <div className="flex items-center gap-3">
        <StatusBadge label={meta.label} tone={meta.tone} />
        <Button asChild variant="outline">
          <Link href={`/applications/${existing.id}`}>View application</Link>
        </Button>
      </div>
    );
  }

  return (
    <ConfirmDialog
      trigger={
        <Button size="lg" disabled={submitting}>
          Apply now
        </Button>
      }
      title="Submit your application?"
      description="Your résumé on file will be attached. You'll then complete any required assessments before review."
      confirmLabel="Submit application"
      onConfirm={async () => {
        setSubmitting(true);
        try {
          const app = await dispatch(submitApplication(jobId)).unwrap();
          toast.success("Application submitted");
          router.push(`/applications/${app.id}`);
        } catch {
          setSubmitting(false);
        }
      }}
    />
  );
}
