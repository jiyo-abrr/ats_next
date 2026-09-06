import { apiClient } from "@/lib/api/client";
import type { Permission, Role } from "@/features/rbac/schema";

export const listRoles = () => apiClient<Role[]>("rbac/roles");
export const listPermissions = () => apiClient<Permission[]>("rbac/permissions");

export const grant = (roleName: string, permissionKey: string) =>
  apiClient<void>(`rbac/roles/${roleName}/permissions/${permissionKey}`, {
    method: "POST",
  });

export const revoke = (roleName: string, permissionKey: string) =>
  apiClient<void>(`rbac/roles/${roleName}/permissions/${permissionKey}`, {
    method: "DELETE",
  });
