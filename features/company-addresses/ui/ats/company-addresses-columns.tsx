import type { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { CompanyAddress } from "@/features/company-addresses/schema";

export function companyAddressesColumns(
  onEdit: (a: CompanyAddress) => void,
): ColumnDef<CompanyAddress, unknown>[] {
  return [
    {
      accessorKey: "label",
      header: "Label",
      meta: { sortId: "label" },
      cell: ({ row }) => (
        <span className="font-medium">{row.original.label}</span>
      ),
    },
    {
      id: "address",
      header: "Address",
      cell: ({ row }) => {
        const a = row.original;
        return (
          <span className="text-muted-foreground">
            {[a.line1, a.city, a.state_province, a.country]
              .filter(Boolean)
              .join(", ")}
          </span>
        );
      },
    },
    {
      accessorKey: "city",
      header: "City",
      meta: { sortId: "city", className: "w-40" },
    },
    {
      id: "actions",
      header: "",
      meta: { className: "w-12" },
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(row.original);
          }}
          aria-label="Edit"
        >
          <Pencil />
        </Button>
      ),
    },
  ];
}
