"use client";

import Link from "next/link";
import { ArrowLeft, Building2, Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ErrorState } from "@/components/states";
import { EMPLOYMENT_TYPE_LABELS } from "@/lib/constants";
import { salaryLabel } from "@/lib/utils/format";
import { ApplyButton } from "./apply-button";
import { useJobPost } from "@/features/job-posts/hooks";
import { RichText } from "@/components/rich-text-editor";

function Prose({ title, body }: { title: string; body: string }) {
  return (
    <section className="space-y-2">
      <h2 className="text-sm font-semibold tracking-wide uppercase">{title}</h2>
      <RichText html={body} className="text-muted-foreground" />
    </section>
  );
}

export function JobDetailView({ jobId }: { jobId: string }) {
  const { job, loading, error, refetch } = useJobPost(jobId);

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <ErrorState message="This role could not be loaded." onRetry={refetch} />
      </div>
    );
  }

  if (loading || !job) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-10">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const published = job.status === "published";
  const salary = salaryLabel(job);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link
        href="/jobs"
        className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="size-4" /> All roles
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">
            {job.job_title}
          </h1>
          <p className="text-muted-foreground">{job.position_title}</p>
        </div>
        {published ? <ApplyButton jobId={job.id} /> : null}
      </div>

      <div className="text-muted-foreground mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
        <span className="flex items-center gap-1.5">
          <Building2 className="size-4" />
          {job.company_address_label}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="size-4" />
          {EMPLOYMENT_TYPE_LABELS[job.employment_type]}
        </span>
        {salary ? <span>{salary}</span> : null}
      </div>

      {job.tags.length ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {job.tags.map((t) => (
            <Badge key={t.id} variant="secondary" className="font-normal">
              {t.name}
            </Badge>
          ))}
        </div>
      ) : null}

      {!published ? (
        <p className="bg-muted mt-6 rounded-md px-3 py-2 text-sm">
          This role is not currently open for applications.
        </p>
      ) : null}

      <Separator className="my-8" />

      <div className="space-y-8">
        <Prose title="About the role" body={job.description} />
        <Prose title="Requirements" body={job.requirements} />
        <Prose title="Qualifications" body={job.qualifications} />
      </div>
    </div>
  );
}
