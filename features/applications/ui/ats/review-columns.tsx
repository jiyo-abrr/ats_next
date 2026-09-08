import type { ColumnDef } from "@tanstack/react-table";

import { StatusBadge } from "@/components/status-badge";
import { APPLICATION_STATUS } from "@/lib/constants";
import { formatDate } from "@/lib/utils/format";
import type { ApplicationReview } from "@/features/applications/schema";

export const reviewColumns: ColumnDef<ApplicationReview, unknown>[] = [
  {
    id: "applicant",
    header: "Applicant",
    cell: ({ row }) => (
      <div className="space-y-0.5">
        <span className="font-medium">
          {row.original.applicant_first_name} {row.original.applicant_last_name}
        </span>
        <p className="text-muted-foreground text-xs">
          {row.original.applicant_email}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "job_title",
    header: "Role",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.job_title}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    meta: { className: "w-36" },
    cell: ({ row }) => {
      const m = APPLICATION_STATUS[row.original.status];
      return <StatusBadge label={m.label} tone={m.tone} />;
    },
  },
  {
    accessorKey: "created_at",
    header: "Applied",
    meta: { className: "w-28" },
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {formatDate(row.original.created_at)}
      </span>
    ),
  },
];

/** Same table, minus the Role column — for lists already scoped to one job post. */
export const applicantColumns = reviewColumns.filter(
  (c) => !("accessorKey" in c && c.accessorKey === "job_title"),
);

/** For an applicant's own page — the review table minus the Applicant column
 * (every row is the same person). */
export const applicantApplicationColumns = reviewColumns.filter(
  (c) => c.id !== "applicant",
);
