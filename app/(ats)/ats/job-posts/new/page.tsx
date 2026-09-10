import { Suspense } from "react";
import type { Metadata } from "next";

import { JobPostCreateView } from "@/components/job-posts/ats/create/job-post-create-view";
import { FormSkeleton } from "@/components/page-skeleton";

export const metadata: Metadata = { title: "New job post" };

export default function NewJobPostPage() {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <JobPostCreateView />
    </Suspense>
  );
}
