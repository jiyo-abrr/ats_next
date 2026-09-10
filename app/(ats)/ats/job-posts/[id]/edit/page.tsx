import { Suspense } from "react";
import type { Metadata } from "next";

import { JobPostEditView } from "@/components/job-posts/ats/edit/job-post-edit-view";
import { FormSkeleton } from "@/components/page-skeleton";

export const metadata: Metadata = { title: "Edit job post" };

export default async function JobPostEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense fallback={<FormSkeleton />}>
      <JobPostEditView id={id} />
    </Suspense>
  );
}
