"use client";

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/pagination";
import { StatusBadge } from "@/components/status-badge";
import * as applicationsService from "@/features/applications/applicationsService";
import type { ApplicationScorecard } from "@/features/applications/schema";
import { useJobPost } from "@/features/job-posts/hooks";
import { ATTEMPT_STATUS, TEMPLATE_TYPE_LABELS } from "@/lib/constants";
import type { TemplateType } from "@/lib/types";
import type { ColumnDef } from "@tanstack/react-table";
import { RECOMMENDATION_LABELS, TEMPLATE_ORDER } from "../shared/constants";
import { applicantName, duration } from "../shared/format";
import { usePaged } from "../shared/use-paged";
import { ResumeCell } from "./resume-cell";

export function ScorecardTable({ jobId }: { jobId: string }) {
  const { job } = useJobPost(jobId);
  const p = usePaged<ApplicationScorecard>((qs) =>
    applicationsService.getAssessmentScorecard(`job_post_id=${jobId}&${qs}`),
  );

  const attached: Record<TemplateType, boolean> = {
    pre_assessment: !!job?.pre_assessment_template_id,
    culture_fit: !!job?.culture_fit_template_id,
    technical: !!job?.technical_assessment_template_id,
  };

  const columns: ColumnDef<ApplicationScorecard, unknown>[] = [
    {
      id: "applicant",
      header: "Applicant",
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <span className="font-medium">
            {row.original.applicant_first_name}{" "}
            {row.original.applicant_last_name}
          </span>
          <p className="text-muted-foreground text-xs">
            {row.original.applicant_email}
          </p>
        </div>
      ),
    },
    {
      id: "resume",
      header: "Résumé",
      meta: { className: "w-40" },
      cell: ({ row }) => (
        <ResumeCell
          id={row.original.id}
          name={applicantName({
            first: row.original.applicant_first_name,
            last: row.original.applicant_last_name,
          })}
        />
      ),
    },
    ...TEMPLATE_ORDER.map(
      (t): ColumnDef<ApplicationScorecard, unknown> => ({
        id: t,
        header: TEMPLATE_TYPE_LABELS[t],
        meta: { className: "w-44" },
        cell: ({ row }) => {
          const s = row.original.assessments.find((x) => x.template_type === t);
          if (!s)
            return (
              <span className="text-muted-foreground text-xs">
                {attached[t] ? "No attempt" : "Not attached"}
              </span>
            );
          const meta = ATTEMPT_STATUS[s.status];
          const dur = duration(s.started_at, s.completed_at);
          return (
            <div className="space-y-1">
              <StatusBadge label={meta.label} tone={meta.tone} />
              <p className="text-muted-foreground text-xs">
                {s.answered_count}/{s.total_questions} answered
                {dur ? ` · ${dur}` : ""}
              </p>
            </div>
          );
        },
      }),
    ),
    {
      id: "evaluation",
      header: "AI evaluation",
      meta: { className: "w-40" },
      cell: ({ row }) => {
        const e = row.original.evaluation;
        if (!e || (e.recommendation === null && e.fit_score === null))
          return <span className="text-muted-foreground text-xs">—</span>;
        const tone =
          e.recommendation === "advance"
            ? "success"
            : e.recommendation === "reject"
              ? "danger"
              : "warning";
        return (
          <div className="space-y-1">
            {e.recommendation ? (
              <StatusBadge
                label={RECOMMENDATION_LABELS[e.recommendation]}
                tone={tone}
              />
            ) : null}
            {e.fit_score !== null ? (
              <p className="text-muted-foreground text-xs">Fit {e.fit_score}/100</p>
            ) : null}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-3">
      <DataTable
        columns={columns}
        data={p.items}
        isLoading={p.loading && p.items.length === 0}
        isError={!!p.error}
        onRetry={p.retry}
        getRowHref={(row) => `/ats/applications/${row.id}`}
        emptyMessage="No one has applied to this job post yet."
      />
      <DataTablePagination
        page={p.page}
        size={p.size}
        total={p.total}
        pages={p.pages}
        onPageChange={p.setPage}
        onSizeChange={p.setSize}
        isLoading={p.loading}
      />
    </div>
  );
}
