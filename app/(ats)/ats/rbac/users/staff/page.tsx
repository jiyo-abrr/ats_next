import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { StaffUsersView } from "@/features/rbac/ui/ats/staff-users-view";
import { DetailSkeleton } from "@/components/page-skeleton";
import { getServerUser } from "@/lib/server/api";

export const metadata: Metadata = { title: "Staff accounts" };

export default async function StaffUsersPage() {
  const user = await getServerUser();
  if (user?.role !== "admin") redirect("/ats");
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <StaffUsersView />
    </Suspense>
  );
}
