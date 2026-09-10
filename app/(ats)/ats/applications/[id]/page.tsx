import { Suspense } from "react";

import { ApplicationReviewDetailView } from "@/components/applications/ats/review-detail/application-review-detail-view";
import { DetailSkeleton } from "@/components/page-skeleton";

export default async function AtsApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <ApplicationReviewDetailView id={id} />
    </Suspense>
  );
}
