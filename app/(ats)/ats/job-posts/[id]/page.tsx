import { Suspense } from "react";

import { JobPostApplicantsView } from "@/features/job-posts/ui/ats/job-post-applicants-view";
import { DetailSkeleton } from "@/components/page-skeleton";

export default async function JobPostApplicantsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <JobPostApplicantsView id={id} />
    </Suspense>
  );
}
