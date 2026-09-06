"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { useAppDispatch } from "@/lib/hooks/redux";
import { toast } from "@/lib/utils/toast";
import { updateJobPost } from "@/lib/store/jobPostsSlice";
import type { JobPost } from "@/features/job-posts/schema";
import { type JobPostInput, jobPostSchema } from "@/features/job-posts/schema";
import {
  JobPostForm,
  jobPostFormBody,
  jobPostFormValues,
} from "../job-post-form";
import { useJobPostFormOptions } from "../use-form-options";

export function DetailsPanel({ job }: { job: JobPost }) {
  const dispatch = useAppDispatch();
  const { positions, addresses } = useJobPostFormOptions();

  const form = useForm<JobPostInput>({
    resolver: zodResolver(jobPostSchema),
    values: jobPostFormValues(job),
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await dispatch(
        updateJobPost({ id: job.id, body: jobPostFormBody(values) }),
      ).unwrap();
      toast.success("Details saved");
      form.reset(values);
    } catch {
      /* handled */
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <JobPostForm form={form} positions={positions} addresses={addresses} />
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={form.formState.isSubmitting || !form.formState.isDirty}
        >
          {form.formState.isSubmitting ? "Saving…" : "Save details"}
        </Button>
      </div>
    </form>
  );
}
