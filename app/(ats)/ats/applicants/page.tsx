import { Suspense } from "react";
import type { Metadata } from "next";

import { ApplicantsView } from "@/features/applications/ui/ats/applicants-view";
import { TableSkeleton } from "@/components/data-table/table-skeleton";

export const metadata: Metadata = { title: "Applicants" };

export default function AtsApplicantsPage() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <ApplicantsView />
    </Suspense>
  );
}
