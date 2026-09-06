import type { ColumnDef } from "@tanstack/react-table";

import { StatusBadge } from "@/components/status-badge";
import { EMPLOYMENT_TYPE_LABELS, JOB_POST_STATUS } from "@/lib/constants";
import { formatDate, salaryLabel } from "@/lib/utils/format";
import type { JobPost } from "@/features/job-posts/schema";

export const jobPostsColumns: ColumnDef<JobPost, unknown>[] = [
  {
    accessorKey: "job_title",
    header: "Title",
    meta: { sortId: "job_title" },
    cell: ({ row }) => (
      <div className="space-y-0.5">
        <span className="font-medium">{row.original.job_title}</span>
        <p className="text-muted-foreground text-xs">
          {row.original.position_title}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    meta: { sortId: "status", className: "w-28" },
    cell: ({ row }) => {
      const m = JOB_POST_STATUS[row.original.status];
      return <StatusBadge label={m.label} tone={m.tone} />;
    },
  },
  {
    accessorKey: "employment_type",
    header: "Type",
    meta: { className: "w-32" },
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {EMPLOYMENT_TYPE_LABELS[row.original.employment_type]}
      </span>
    ),
  },
  {
    id: "salary",
    header: "Salary",
    meta: { className: "w-36" },
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {salaryLabel(row.original) ?? "—"}
      </span>
    ),
  },
  {
    id: "tags",
    header: "Tags",
    meta: { className: "w-20" },
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.tags.length || "—"}
      </span>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Created",
    meta: { sortId: "created_at", className: "w-28" },
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {formatDate(row.original.created_at)}
      </span>
    ),
  },
];
