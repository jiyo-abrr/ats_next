"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/pagination";
import { DataTableToolbar } from "@/components/data-table/toolbar";
import { FilterSelect } from "@/components/data-table/filter-select";
import { EMPLOYMENT_TYPE_LABELS, JOB_POST_STATUS } from "@/lib/constants";
import { useJobPostsList } from "@/features/job-posts/hooks";
import { jobPostsColumns } from "./job-posts-columns";

const statusOptions = Object.entries(JOB_POST_STATUS).map(([value, m]) => ({
  value,
  label: m.label,
}));
const employmentOptions = Object.entries(EMPLOYMENT_TYPE_LABELS).map(
  ([value, label]) => ({ value, label }),
);

export function JobPostsView() {
  const {
    jobs,
    total,
    pages,
    loading,
    error,
    query,
    setPage,
    setSize,
    setSearch,
    setFilter,
    toggleSort,
    refetch,
  } = useJobPostsList();

  return (
    <div>
      <PageHeader
        title="Job posts"
        description="Create and manage every role."
        actions={
          <Button asChild>
            <Link href="/ats/job-posts/new">
              <Plus /> New job post
            </Link>
          </Button>
        }
      />

      <DataTableToolbar
        search={query.search}
        onSearchChange={setSearch}
        searchPlaceholder="Search titles…"
        filters={
          <>
            <FilterSelect
              label="Status"
              value={query.filters.status ?? ""}
              onChange={(v) => setFilter("status", v)}
              options={statusOptions}
            />
            <FilterSelect
              label="Type"
              value={query.filters.employment_type ?? ""}
              onChange={(v) => setFilter("employment_type", v)}
              options={employmentOptions}
            />
          </>
        }
      />

      <DataTable
        columns={jobPostsColumns}
        data={jobs}
        isLoading={loading && jobs.length === 0}
        isError={!!error}
        onRetry={refetch}
        sort={query.sort}
        onToggleSort={toggleSort}
        getRowHref={(row) => `/ats/job-posts/${row.id}`}
        emptyMessage="No job posts yet."
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
