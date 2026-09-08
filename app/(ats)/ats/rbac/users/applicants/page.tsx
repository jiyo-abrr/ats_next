import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ApplicantsUsersView } from "@/features/rbac/ui/ats/applicants-users-view";
import { DetailSkeleton } from "@/components/page-skeleton";
import { getServerUser } from "@/lib/server/api";

export const metadata: Metadata = { title: "Applicant accounts" };

export default async function ApplicantsUsersPage() {
  const user = await getServerUser();
  if (user?.role !== "admin") redirect("/ats");
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <ApplicantsUsersView />
    </Suspense>
  );
}
