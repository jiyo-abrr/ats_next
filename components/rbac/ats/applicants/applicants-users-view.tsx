"use client";

import { LinkTabs } from "@/components/link-tabs";
import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/pagination";
import { DataTableToolbar } from "@/components/data-table/toolbar";
import { toast } from "@/lib/utils/toast";
import { useAppDispatch } from "@/lib/hooks/redux";
import { setUserActive } from "@/lib/store/usersSlice";
import { useUsers } from "@/features/rbac/hooks";
import type { User } from "@/features/auth/schema";
import { applicantUsersColumns } from "./applicant-users-columns";

export function ApplicantsUsersView() {
  const dispatch = useAppDispatch();
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
  } = useUsers("applicants");

  const onToggleActive = async (user: User) => {
    try {
      await dispatch(
        setUserActive({ id: user.id, active: !user.is_active }),
      ).unwrap();
      toast.success(user.is_active ? "Account deactivated" : "Account activated");
    } catch {
      /* toast-error middleware surfaces it */
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="User accounts"
        description="Staff accounts (admin & HR) and applicant accounts, separately."
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
        columns={applicantUsersColumns(onToggleActive)}
        data={data}
        isLoading={loading && data.length === 0}
        isError={!!error}
        onRetry={refetch}
        sort={query.sort}
        onToggleSort={toggleSort}
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
