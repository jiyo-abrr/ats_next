import { Suspense } from "react";
import type { Metadata } from "next";

import { TemplatesView } from "@/features/templates/ui/ats/templates-view";
import { TableSkeleton } from "@/components/data-table/table-skeleton";

export const metadata: Metadata = { title: "Assessment templates" };

export default function TemplatesPage() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <TemplatesView />
    </Suspense>
  );
}
