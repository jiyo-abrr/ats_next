import { Suspense } from "react";

import { ApplicantDetailView } from "@/features/applications/ui/ats/applicant-detail-view";
import { DetailSkeleton } from "@/components/page-skeleton";

export default async function AtsApplicantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <ApplicantDetailView id={id} />
    </Suspense>
  );
}
