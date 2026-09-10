"use client";

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/pagination";
import { DataTableToolbar } from "@/components/data-table/toolbar";
import { FilterSelect } from "@/components/data-table/filter-select";
import { APPLICATION_STATUS } from "@/lib/constants";
import { useJobApplicants } from "@/features/applications/hooks";
import { applicantColumns } from "@/components/applications/ats/shared/review-columns";

const statusOptions = Object.entries(APPLICATION_STATUS).map(([value, m]) => ({
  value,
  label: m.label,
}));

export function ApplicantsPanel({ jobPostId }: { jobPostId: string }) {
  const {
    data,
    total,
    pages,
    loading,
    error,
    query,
    setPage,
    setSize,
    setFilter,
    refetch,
  } = useJobApplicants(jobPostId);

  return (
    <div className="space-y-3">
      <DataTableToolbar
        filters={
          <FilterSelect
            label="Status"
            value={query.filters.status ?? ""}
            onChange={(v) => setFilter("status", v)}
            options={statusOptions}
          />
        }
      />

      <DataTable
        columns={applicantColumns}
        data={data}
        isLoading={loading && data.length === 0}
        isError={!!error}
        onRetry={refetch}
        getRowHref={(row) => `/ats/applications/${row.id}`}
        emptyMessage="No one has applied to this job post yet."
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
