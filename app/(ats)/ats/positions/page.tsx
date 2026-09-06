import { Suspense } from "react";
import type { Metadata } from "next";

import { PositionsView } from "@/features/positions/ui/ats/positions-view";
import { TableSkeleton } from "@/components/data-table/table-skeleton";

export const metadata: Metadata = { title: "Positions" };

export default function PositionsPage() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <PositionsView />
    </Suspense>
  );
}
