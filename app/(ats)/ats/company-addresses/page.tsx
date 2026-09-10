import { Suspense } from "react";
import type { Metadata } from "next";

import { CompanyAddressesView } from "@/components/company-addresses/ats/list/company-addresses-view";
import { TableSkeleton } from "@/components/data-table/table-skeleton";

export const metadata: Metadata = { title: "Locations" };

export default function CompanyAddressesPage() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <CompanyAddressesView />
    </Suspense>
  );
}
