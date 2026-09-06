"use client";

import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/pagination";
import { DataTableToolbar } from "@/components/data-table/toolbar";
import { FilterSelect } from "@/components/data-table/filter-select";
import { APPLICATION_STATUS } from "@/lib/constants";
import { useApplicationsForReview } from "@/features/applications/hooks";
import { reviewColumns } from "./review-columns";

const statusOptions = Object.entries(APPLICATION_STATUS).map(([value, m]) => ({
  value,
  label: m.label,
}));

export function ReviewView() {
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
  } = useApplicationsForReview();

  return (
    <div>
      <PageHeader
        title="Applications"
        description="Review candidates and drive the hiring pipeline."
      />

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
        columns={reviewColumns}
        data={data}
        isLoading={loading && data.length === 0}
        isError={!!error}
        onRetry={refetch}
        getRowHref={(row) => `/ats/applications/${row.id}`}
        emptyMessage="No applications match."
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
