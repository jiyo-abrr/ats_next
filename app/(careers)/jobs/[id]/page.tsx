import { Suspense } from "react";

import { JobDetailView } from "@/features/job-posts/ui/careers/job-detail-view";
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
