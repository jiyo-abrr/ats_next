import type { ColumnDef } from "@tanstack/react-table";

import { formatDate } from "@/lib/utils/format";
import type { ApplicantRollup } from "@/features/applications/schema";

export const applicantRollupColumns: ColumnDef<ApplicantRollup, unknown>[] = [
  {
    id: "applicant",
    header: "Applicant",
    cell: ({ row }) => (
      <div className="space-y-0.5">
        <span className="font-medium">
          {row.original.first_name} {row.original.last_name}
        </span>
        <p className="text-muted-foreground text-xs">{row.original.email}</p>
      </div>
    ),
  },
  {
    accessorKey: "application_count",
    header: "Applications",
    meta: { className: "w-28" },
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.application_count}
      </span>
    ),
  },
  {
    accessorKey: "latest_applied_at",
    header: "Last applied",
    meta: { className: "w-32" },
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {formatDate(row.original.latest_applied_at)}
      </span>
    ),
  },
];
