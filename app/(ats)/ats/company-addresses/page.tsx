import { Suspense } from "react";
import type { Metadata } from "next";

import { CompanyAddressesView } from "@/features/company-addresses/ui/ats/company-addresses-view";
import { TableSkeleton } from "@/components/data-table/table-skeleton";

export const metadata: Metadata = { title: "Locations" };

export default function CompanyAddressesPage() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <CompanyAddressesView />
    </Suspense>
  );
}
