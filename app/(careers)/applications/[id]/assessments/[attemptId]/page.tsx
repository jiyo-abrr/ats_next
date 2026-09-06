import { Suspense } from "react";
import type { Metadata } from "next";

import { AttemptRunnerView } from "@/features/assessments/ui/careers/attempt-runner-view";
import { DetailSkeleton } from "@/components/page-skeleton";

export const metadata: Metadata = { title: "Assessment" };

export default async function AttemptPage({
  params,
}: {
  params: Promise<{ id: string; attemptId: string }>;
}) {
  const { attemptId } = await params;
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <AttemptRunnerView attemptId={attemptId} />
    </Suspense>
  );
}
