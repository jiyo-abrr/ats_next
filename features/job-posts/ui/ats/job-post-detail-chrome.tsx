"use client";

import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { LinkTabs } from "@/components/link-tabs";
import { ErrorState } from "@/components/states";
import { StatusBadge } from "@/components/status-badge";
import { JOB_POST_STATUS } from "@/lib/constants";
import { useJobPost } from "@/features/job-posts/hooks";

export function JobPostDetailChrome({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { job, loading, error, refetch } = useJobPost(id);

  if (error) {
    return (
      <ErrorState
        message="This job post could not be loaded."
        onRetry={refetch}
      />
    );
  }
  if (loading || !job) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const meta = JOB_POST_STATUS[job.status];
  const base = `/ats/job-posts/${job.id}`;

  return (
    <div className="space-y-5">
      <Breadcrumbs
        items={[
          { label: "Job posts", href: "/ats/job-posts" },
          { label: job.job_title },
        ]}
      />
      <Link
        href="/ats/job-posts"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="size-4" /> Job posts
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {job.job_title}
          </h1>
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <StatusBadge label={meta.label} tone={meta.tone} />
            <span>{job.position_title}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/jobs/${job.id}`} target="_blank">
              Preview
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href={`${base}/edit`}>
              <Pencil /> Edit job post
            </Link>
          </Button>
        </div>
      </div>

      <LinkTabs
        items={[
          { href: base, label: "Applicants" },
          { href: `${base}/pipeline`, label: "Pipeline" },
          { href: `${base}/compare`, label: "Compare" },
        ]}
      />

      <div className="pt-1">{children}</div>
    </div>
  );
}
