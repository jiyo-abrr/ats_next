"use client";

import { Briefcase } from "lucide-react";

import { DataTablePagination } from "@/components/data-table/pagination";
import { DataTableToolbar } from "@/components/data-table/toolbar";
import { FilterSelect } from "@/components/data-table/filter-select";
import { EmptyState, ErrorState } from "@/components/states";
import { Skeleton } from "@/components/ui/skeleton";
import { EMPLOYMENT_TYPE_LABELS } from "@/lib/constants";
import { JobCard } from "./job-card";
import { useJobList } from "@/features/job-posts/hooks";

const employmentOptions = Object.entries(EMPLOYMENT_TYPE_LABELS).map(
  ([value, label]) => ({ value, label }),
);

export function JobListView() {
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
    refetch,
  } = useJobList();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="pb-6">
        <h1 className="text-3xl font-semibold tracking-tight">Open roles</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {loading && jobs.length === 0
            ? "…"
            : `${total} position${total === 1 ? "" : "s"}`}
        </p>
      </div>

      <DataTableToolbar
        search={query.search}
        onSearchChange={setSearch}
        searchPlaceholder="Search roles…"
        filters={
          <FilterSelect
            label="Type"
            value={query.filters.employment_type ?? ""}
            onChange={(v) => setFilter("employment_type", v)}
            options={employmentOptions}
          />
        }
      />

      {error ? (
        <ErrorState message="Couldn't load job listings." onRetry={refetch} />
      ) : loading && jobs.length === 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No roles match"
          description="Try clearing filters or checking back later."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}

      {jobs.length > 0 ? (
        <div className="pt-4">
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
      ) : null}
    </div>
  );
}
