import { Suspense } from "react";

import { JobDetailView } from "@/components/job-posts/careers/detail/job-detail-view";
import { DetailSkeleton } from "@/components/page-skeleton";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <JobDetailView jobId={id} />
    </Suspense>
  );
}
