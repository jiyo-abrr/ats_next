"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/pagination";
import { DataTableToolbar } from "@/components/data-table/toolbar";
import { FilterSelect } from "@/components/data-table/filter-select";
import { APPLICATION_STATUS } from "@/lib/constants";
import { useApplicantApplications } from "@/features/applications/hooks";
import { applicantApplicationColumns } from "./review-columns";

const statusOptions = Object.entries(APPLICATION_STATUS).map(([value, m]) => ({
  value,
  label: m.label,
}));

export function ApplicantDetailView({ id }: { id: string }) {
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
  } = useApplicantApplications(id);

  const first = data[0];
  const name = first
    ? `${first.applicant_first_name} ${first.applicant_last_name}`
    : "Applicant";

  return (
    <div className="space-y-5">
      <Breadcrumbs
        items={[{ label: "Applicants", href: "/ats/applicants" }, { label: name }]}
      />
      <Link
        href="/ats/applicants"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="size-4" /> Applicants
      </Link>

      <PageHeader title={name} description={first?.applicant_email} />

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
        columns={applicantApplicationColumns}
        data={data}
        isLoading={loading && data.length === 0}
        isError={!!error}
        onRetry={refetch}
        getRowHref={(row) => `/ats/applications/${row.id}?from=applicant`}
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
