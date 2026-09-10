import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils/format";
import type { User } from "@/features/auth/schema";

export const usersColumns: ColumnDef<User, unknown>[] = [
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
    accessorKey: "role",
    header: "Role",
    meta: { sortId: "role", className: "w-28" },
    cell: ({ row }) => (
      <Badge variant={row.original.role === "applicant" ? "outline" : "secondary"}>
        {ROLE_LABELS[row.original.role]}
      </Badge>
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
];
