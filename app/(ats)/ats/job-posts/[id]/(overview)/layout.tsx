import { JobPostDetailChrome } from "@/components/job-posts/ats/shared/job-post-detail-chrome";

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
