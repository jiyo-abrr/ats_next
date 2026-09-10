import { Suspense } from "react";
import type { Metadata } from "next";

import { JobPostsView } from "@/components/job-posts/ats/list/job-posts-view";
import { TableSkeleton } from "@/components/data-table/table-skeleton";

export const metadata: Metadata = { title: "Job posts" };

export default function JobPostsPage() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <JobPostsView />
    </Suspense>
  );
}
