import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { RbacView } from "@/components/rbac/ats/permissions/rbac-view";
import { DetailSkeleton } from "@/components/page-skeleton";
import { getServerUser } from "@/lib/server/api";

export const metadata: Metadata = { title: "Roles & permissions" };

export default async function RbacPage() {
  const user = await getServerUser();
  if (user?.role !== "admin") redirect("/ats");
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <RbacView />
    </Suspense>
  );
}
