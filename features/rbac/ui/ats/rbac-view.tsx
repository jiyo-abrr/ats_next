"use client";

import { PageHeader } from "@/components/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/states";
import { useRbac } from "@/features/rbac/hooks";
import { RolePermissionMatrix } from "./role-permission-matrix";
import { CreateHrAccountForm } from "./create-hr-account-form";

export function RbacView() {
  const { roles, permissions, loading, error, pending, refetch } = useRbac();

  return (
    <div className="space-y-8">
      <div>
        <PageHeader
          title="Access control"
          description="Grant or revoke permissions per role. Changes take effect on the next request — no re-login."
        />
        {error ? (
          <ErrorState message="Couldn't load access control." onRetry={refetch} />
        ) : loading && roles.length === 0 ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <RolePermissionMatrix
            roles={roles}
            permissions={permissions}
            pending={pending}
          />
        )}
      </div>

      <div className="max-w-2xl">
        <CreateHrAccountForm />
      </div>
    </div>
  );
}
