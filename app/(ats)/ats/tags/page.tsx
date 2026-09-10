import { Suspense } from "react";
import type { Metadata } from "next";

import { TagsView } from "@/components/tags/ats/list/tags-view";
import { TableSkeleton } from "@/components/data-table/table-skeleton";

export const metadata: Metadata = { title: "Tags" };

export default function TagsPage() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <TagsView />
    </Suspense>
  );
}
