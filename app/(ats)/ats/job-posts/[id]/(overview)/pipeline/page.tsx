import { Suspense } from "react";
import type { Metadata } from "next";

import { PipelineView } from "@/components/applications/ats/pipeline/pipeline-view";
import { DetailSkeleton } from "@/components/page-skeleton";

export const metadata: Metadata = { title: "Hiring pipeline" };

export default async function JobPostPipelinePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <PipelineView jobId={id} />
    </Suspense>
  );
}
