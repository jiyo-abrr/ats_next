import type { ColumnDef } from "@tanstack/react-table";

import { StatusBadge } from "@/components/status-badge";
import { APPLICATION_STATUS } from "@/lib/constants";
import { formatDate } from "@/lib/utils/format";
import type { ApplicationSummary } from "@/features/applications/schema";

export const myApplicationsColumns: ColumnDef<ApplicationSummary, unknown>[] = [
  {
    accessorKey: "job_title",
    header: "Role",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.job_title}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    meta: { className: "w-40" },
    cell: ({ row }) => {
      const meta = APPLICATION_STATUS[row.original.status];
      return (
        <span className="flex flex-wrap items-center gap-1.5">
          <StatusBadge label={meta.label} tone={meta.tone} />
          {row.original.needs_interview_pick ? (
            <StatusBadge label="Pick a time" tone="warning" />
          ) : null}
        </span>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Applied",
    meta: { className: "w-36" },
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {formatDate(row.original.created_at)}
      </span>
    ),
  },
];
