"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { useAppDispatch } from "@/lib/hooks/redux";
import { toast } from "@/lib/utils/toast";
import { createJobPost } from "@/lib/store/jobPostsSlice";
import { type JobPostInput, jobPostSchema } from "@/features/job-posts/schema";
import {
  JobPostForm,
  jobPostFormBody,
  jobPostFormValues,
} from "./job-post-form";
import { useJobPostFormOptions } from "./use-form-options";

export function JobPostCreateView() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { positions, addresses } = useJobPostFormOptions();

  const form = useForm<JobPostInput>({
    resolver: zodResolver(jobPostSchema),
    defaultValues: jobPostFormValues(),
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const job = await dispatch(
        createJobPost(jobPostFormBody(values)),
      ).unwrap();
      toast.success("Job post created");
      router.push(`/ats/job-posts/${job.id}/edit`);
    } catch {
      /* toast handled by middleware */
    }
  });

  return (
    <div className="max-w-3xl">
      <Link
        href="/ats/job-posts"
        className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="size-4" /> Job posts
      </Link>
      <PageHeader
        title="New job post"
        description="Fill in the details — attach tags, exclusions and assessments after creating."
      />
      <form onSubmit={onSubmit} className="space-y-6">
        <JobPostForm form={form} positions={positions} addresses={addresses} />
        <div className="flex justify-end gap-2">
          <Button asChild type="button" variant="outline">
            <Link href="/ats/job-posts">Cancel</Link>
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Creating…" : "Create job post"}
          </Button>
        </div>
      </form>
    </div>
  );
}
