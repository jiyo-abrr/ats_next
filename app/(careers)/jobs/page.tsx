import { Suspense } from "react";
import type { Metadata } from "next";

import { JobListView } from "@/components/job-posts/careers/list/job-list-view";
import { TableSkeleton } from "@/components/data-table/table-skeleton";

export const metadata: Metadata = { title: "Open roles" };

export default function JobsPage() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <JobListView />
    </Suspense>
  );
}
