import { Suspense } from "react";
import type { Metadata } from "next";

import { DashboardView } from "@/features/dashboard/ui/ats/dashboard-view";
import { DetailSkeleton } from "@/components/page-skeleton";

export const metadata: Metadata = { title: "Dashboard" };

export default function AtsDashboardPage() {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <DashboardView />
    </Suspense>
  );
}
