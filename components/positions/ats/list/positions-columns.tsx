import type { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";

import { RowActions } from "@/components/data-table/row-actions";
import { formatDate } from "@/lib/utils/format";
import type { Position } from "@/features/positions/schema";

export function positionsColumns(
  onEdit: (p: Position) => void,
): ColumnDef<Position, unknown>[] {
  return [
    {
      accessorKey: "title",
      header: "Title",
      meta: { sortId: "title" },
      cell: ({ row }) => (
        <span className="font-medium">{row.original.title}</span>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <span className="text-muted-foreground line-clamp-1 max-w-md">
          {row.original.description || "—"}
        </span>
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
      id: "actions",
      header: "",
      meta: { className: "w-12" },
      cell: ({ row }) => (
        <RowActions
          actions={[
            {
              label: "Edit",
              icon: Pencil,
              onSelect: () => onEdit(row.original),
            },
          ]}
        />
      ),
    },
  ];
}
