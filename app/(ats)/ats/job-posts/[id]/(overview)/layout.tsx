import { JobPostDetailChrome } from "@/features/job-posts/ui/ats/job-post-detail-chrome";

export default async function JobPostOverviewLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <JobPostDetailChrome id={id}>{children}</JobPostDetailChrome>;
}
