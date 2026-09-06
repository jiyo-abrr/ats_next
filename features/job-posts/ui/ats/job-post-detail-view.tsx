"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ErrorState } from "@/components/states";
import { StatusBadge } from "@/components/status-badge";
import { JOB_POST_STATUS } from "@/lib/constants";
import { useAppDispatch } from "@/lib/hooks/redux";
import { toast } from "@/lib/utils/toast";
import { deleteJobPost } from "@/lib/store/jobPostsSlice";
import { useJobPost } from "@/features/job-posts/hooks";
import { DetailsPanel } from "./_parts/details-panel";
import { TagsPanel } from "./_parts/tags-panel";
import { ExclusionsPanel } from "./_parts/exclusions-panel";
import { TemplatesPanel } from "./_parts/templates-panel";
import { ApplicantsPanel } from "./_parts/applicants-panel";

export function JobPostDetailView({ id }: { id: string }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { job, loading, error, refetch } = useJobPost(id);

  if (error) {
    return (
      <div className="max-w-3xl">
        <ErrorState message="This job post could not be loaded." onRetry={refetch} />
      </div>
    );
  }
  if (loading || !job) {
    return (
      <div className="max-w-3xl space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const meta = JOB_POST_STATUS[job.status];

  return (
    <div className="max-w-3xl space-y-5">
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
          <ConfirmDialog
            trigger={
              <Button variant="destructive" size="sm">
                <Trash2 /> Delete
              </Button>
            }
            title="Delete this job post?"
            description="This removes it and its tag/exclusion links. Applications block the delete."
            destructive
            confirmLabel="Delete"
            onConfirm={async () => {
              try {
                await dispatch(deleteJobPost(id)).unwrap();
                toast.success("Job post deleted");
                router.push("/ats/job-posts");
              } catch {
                /* handled */
              }
            }}
          />
        </div>
      </div>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="applicants">Applicants</TabsTrigger>
          <TabsTrigger value="tags">Tags ({job.tags.length})</TabsTrigger>
          <TabsTrigger value="exclusions">
            Exclusions ({job.excluded_job_post_ids.length})
          </TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
        </TabsList>
        <TabsContent value="details" className="pt-4">
          <DetailsPanel job={job} />
        </TabsContent>
        <TabsContent value="applicants" className="pt-4">
          <ApplicantsPanel jobPostId={job.id} />
        </TabsContent>
        <TabsContent value="tags" className="pt-4">
          <TagsPanel job={job} />
        </TabsContent>
        <TabsContent value="exclusions" className="pt-4">
          <ExclusionsPanel job={job} />
        </TabsContent>
        <TabsContent value="assessments" className="pt-4">
          <TemplatesPanel job={job} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
