import { Suspense } from "react";

import { ApplicationDetailView } from "@/features/applications/ui/careers/application-detail-view";
import { DetailSkeleton } from "@/components/page-skeleton";

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <ApplicationDetailView id={id} />
    </Suspense>
  );
}
