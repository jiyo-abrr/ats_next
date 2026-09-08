import { Suspense } from "react";
import type { Metadata } from "next";

import { CompareView } from "@/features/applications/ui/ats/compare-view";
import { DetailSkeleton } from "@/components/page-skeleton";

export const metadata: Metadata = { title: "Compare applicants" };

export default async function CompareApplicantsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <CompareView jobId={id} />
    </Suspense>
  );
}
