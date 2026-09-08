"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LinkTabs } from "@/components/link-tabs";
import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/pagination";
import { DataTableToolbar } from "@/components/data-table/toolbar";
import { useUsers } from "@/features/rbac/hooks";
import { usersColumns } from "./users-columns";

export function StaffUsersView() {
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
    toggleSort,
    refetch,
  } = useUsers("staff");

  return (
    <div className="space-y-4">
      <PageHeader
        title="User accounts"
        description="Staff accounts (admin & HR) and applicant accounts, separately."
        actions={
          <Button asChild size="sm">
            <Link href="/ats/rbac/users/new">
              <Plus /> New HR account
            </Link>
          </Button>
        }
      />

      <LinkTabs
        items={[
          { href: "/ats/rbac/users/staff", label: "Staff" },
          { href: "/ats/rbac/users/applicants", label: "Applicants" },
        ]}
      />

      <DataTableToolbar
        search={query.search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name or email…"
      />

      <DataTable
        columns={usersColumns}
        data={data}
        isLoading={loading && data.length === 0}
        isError={!!error}
        onRetry={refetch}
        sort={query.sort}
        onToggleSort={toggleSort}
        getRowHref={(row) => `/ats/rbac/users/${row.id}/edit`}
        emptyMessage="No staff accounts yet."
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
