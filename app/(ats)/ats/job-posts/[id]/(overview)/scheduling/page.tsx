import type { Metadata } from "next";

import { JobPostSchedulingView } from "@/features/interviews/ui/ats/job-post-scheduling-view";

export const metadata: Metadata = { title: "Interview scheduling" };

export default async function JobPostSchedulingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <JobPostSchedulingView jobId={id} />;
}
