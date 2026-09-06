"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/pagination";
import { EmptyState } from "@/components/states";
import { useMyApplications } from "@/features/applications/hooks";
import { myApplicationsColumns } from "./my-applications-columns";

export function MyApplicationsView() {
  const {
    data,
    total,
    pages,
    loading,
    error,
    query,
    setPage,
    setSize,
    refetch,
  } = useMyApplications();

  if (!loading && !error && data.length === 0) {
    return (
      <div>
        <PageHeader title="My applications" />
        <EmptyState
          title="No applications yet"
          description="Browse open roles and apply to get started."
          action={
            <Button asChild>
              <Link href="/jobs">Browse jobs</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="My applications"
        description="Track the status of every role you've applied to."
      />
      <DataTable
        columns={myApplicationsColumns}
        data={data}
        isLoading={loading && data.length === 0}
        isError={!!error}
        onRetry={refetch}
        getRowHref={(row) => `/applications/${row.id}`}
        emptyMessage="No applications yet."
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
