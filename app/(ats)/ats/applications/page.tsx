import { Suspense } from "react";
import type { Metadata } from "next";

import { ReviewView } from "@/features/applications/ui/ats/review-view";
import { TableSkeleton } from "@/components/data-table/table-skeleton";

export const metadata: Metadata = { title: "Applications" };

export default function AtsApplicationsPage() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <ReviewView />
    </Suspense>
  );
}
