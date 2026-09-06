"use client";

import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ROLE_LABELS } from "@/lib/constants";
import type { Role } from "@/lib/types";
import { useAppDispatch } from "@/lib/hooks/redux";
import { toast } from "@/lib/utils/toast";
import {
  grantPermission,
  revokePermission,
} from "@/lib/store/rbacSlice";
import type { Permission, Role as RbacRole } from "@/features/rbac/schema";

function roleLabel(name: string) {
  return name in ROLE_LABELS ? ROLE_LABELS[name as Role] : name;
}

export function RolePermissionMatrix({
  roles,
  permissions,
  pending,
}: {
  roles: RbacRole[];
  permissions: Permission[];
  pending: string | null;
}) {
  const dispatch = useAppDispatch();

  const toggle = async (
    role: RbacRole,
    perm: Permission,
    has: boolean,
  ) => {
    const args = { roleName: role.name, permissionKey: perm.key };
    try {
      await dispatch(
        has ? revokePermission(args) : grantPermission(args),
      ).unwrap();
      toast.success(
        `${has ? "Revoked" : "Granted"} ${perm.key} ${has ? "from" : "to"} ${roleLabel(role.name)}`,
      );
    } catch {
      /* handled */
    }
  };

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Permission</TableHead>
            {roles.map((r) => (
              <TableHead key={r.id} className="text-center">
                {roleLabel(r.name)}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {permissions.map((perm) => (
            <TableRow key={perm.id}>
              <TableCell>
                <p className="font-medium">{perm.key}</p>
                {perm.description ? (
                  <p className="text-muted-foreground text-xs">
                    {perm.description}
                  </p>
                ) : null}
              </TableCell>
              {roles.map((role) => {
                const has = role.permissions.some((p) => p.key === perm.key);
                const busy = pending === `${role.name}:${perm.key}`;
                return (
                  <TableCell key={role.id} className="text-center">
                    <Switch
                      checked={has}
                      disabled={busy}
                      onCheckedChange={() => toggle(role, perm, has)}
                      aria-label={`${perm.key} for ${role.name}`}
                    />
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
