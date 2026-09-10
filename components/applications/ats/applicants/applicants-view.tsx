"use client";

import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/pagination";
import { DataTableToolbar } from "@/components/data-table/toolbar";
import { useApplicants } from "@/features/applications/hooks";
import { applicantRollupColumns } from "./applicant-rollup-columns";

export function ApplicantsView() {
  const {
    data,
    total,
    pages,
    loading,
    error,
    query,
    setPage,
    setSize,
    setSearch,
    refetch,
  } = useApplicants();

  return (
    <div>
      <PageHeader
        title="Applicants"
        description="Everyone who has applied. Open one to see every role they applied to."
      />

      <DataTableToolbar
        search={query.search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name or email…"
      />

      <DataTable
        columns={applicantRollupColumns}
        data={data}
        isLoading={loading && data.length === 0}
        isError={!!error}
        onRetry={refetch}
        getRowHref={(row) => `/ats/applicants/${row.applicant_id}`}
        emptyMessage="No applicants yet."
      />

      <DataTablePagination
        page={query.page}
        size={query.size}
        total={total}
        pages={pages}
        onPageChange={setPage}
        onSizeChange={setSize}
        isLoading={loading}
      />
    </div>
  );
}
