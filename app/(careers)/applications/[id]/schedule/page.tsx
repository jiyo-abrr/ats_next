import { Suspense } from "react";
import type { Metadata } from "next";

import { InterviewScheduleView } from "@/components/applications/careers/schedule/interview-schedule-view";
import { DetailSkeleton } from "@/components/page-skeleton";

export const metadata: Metadata = { title: "Schedule your interview" };

export default async function ScheduleInterviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <InterviewScheduleView applicationId={id} />
    </Suspense>
  );
}
