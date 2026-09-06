import { Suspense } from "react";

import { JobPostDetailView } from "@/features/job-posts/ui/ats/job-post-detail-view";
import { DetailSkeleton } from "@/components/page-skeleton";

export default async function JobPostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <JobPostDetailView id={id} />
    </Suspense>
  );
}
