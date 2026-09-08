import type { ColumnDef } from "@tanstack/react-table";

import { Switch } from "@/components/ui/switch";
import { formatDate } from "@/lib/utils/format";
import type { User } from "@/features/auth/schema";

export function applicantUsersColumns(
  onToggleActive: (u: User) => void,
): ColumnDef<User, unknown>[] {
  return [
    {
      id: "name",
      header: "Name",
      meta: { sortId: "first_name" },
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.first_name} {row.original.last_name}
        </span>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      meta: { sortId: "email" },
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.email}</span>
      ),
    },
    {
      accessorKey: "contact_number",
      header: "Contact",
      meta: { className: "w-36" },
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.contact_number}</span>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Created",
      meta: { sortId: "created_at", className: "w-32" },
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {formatDate(row.original.created_at)}
        </span>
      ),
    },
    {
      id: "active",
      header: "Active",
      meta: { className: "w-24" },
      cell: ({ row }) => (
        <Switch
          checked={row.original.is_active}
          onCheckedChange={() => onToggleActive(row.original)}
          onClick={(e) => e.stopPropagation()}
          aria-label={row.original.is_active ? "Deactivate account" : "Activate account"}
        />
      ),
    },
  ];
}
