import { Suspense } from "react";
import type { Metadata } from "next";

import { MyApplicationsView } from "@/features/applications/ui/careers/my-applications-view";
import { TableSkeleton } from "@/components/data-table/table-skeleton";

export const metadata: Metadata = { title: "My applications" };

export default function ApplicationsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Suspense fallback={<TableSkeleton />}>
        <MyApplicationsView />
      </Suspense>
    </div>
  );
}
