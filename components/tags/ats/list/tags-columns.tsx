import type { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";

import { RowActions } from "@/components/data-table/row-actions";
import type { Tag } from "@/features/tags/schema";

export function tagsColumns(
  onEdit: (t: Tag) => void,
): ColumnDef<Tag, unknown>[] {
  return [
    {
      accessorKey: "name",
      header: "Name",
      meta: { sortId: "name" },
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
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
