"use client";

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/pagination";
import * as applicationsService from "@/features/applications/applicationsService";
import type { JobAssessmentReviewRow } from "@/features/applications/schema";
import { ATTEMPT_STATUS, QUESTION_TYPE_LABELS } from "@/lib/constants";
import type { TemplateType } from "@/lib/types";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { usePaged } from "../shared/use-paged";
import { AnswerValue } from "./answer-value";

export function AssessmentAnswersTable({
  jobId,
  templateType,
}: {
  jobId: string;
  templateType: TemplateType;
}) {
  const p = usePaged<JobAssessmentReviewRow>((qs) =>
    applicationsService.getJobAssessmentReview(
      `job_post_id=${jobId}&template_type=${templateType}&${qs}`,
    ),
  );

  // Question set comes from the first row that actually has an attempt.
  const questions = useMemo(() => {
    const withAttempt = p.items.find(
      (r) => r.attempt && r.attempt.questions.length > 0,
    );
    return withAttempt?.attempt?.questions ?? [];
  }, [p.items]);

  const columns: ColumnDef<JobAssessmentReviewRow, unknown>[] = [
    {
      id: "applicant",
      header: "Applicant",
      meta: { className: "sticky left-0 bg-background min-w-[200px]" },
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <span className="font-medium">
            {row.original.applicant_first_name}{" "}
            {row.original.applicant_last_name}
          </span>
          {row.original.attempt ? (
            <p className="text-muted-foreground text-xs">
              {ATTEMPT_STATUS[row.original.attempt.status].label} ·{" "}
              {row.original.attempt.answered_count}/
              {row.original.attempt.total_questions}
            </p>
          ) : (
            <p className="text-muted-foreground text-xs">No attempt</p>
          )}
        </div>
      ),
    },
    ...questions.map(
      (q): ColumnDef<JobAssessmentReviewRow, unknown> => ({
        id: q.question_id,
        header: () => (
          <div className="min-w-[200px] max-w-[280px] whitespace-normal py-1">
            <p className="font-medium">{q.prompt}</p>
            <p className="text-muted-foreground text-xs font-normal">
              {QUESTION_TYPE_LABELS[q.question_type]}
            </p>
          </div>
        ),
        cell: ({ row }) => {
          const ans = row.original.attempt?.questions.find(
            (x) => x.question_id === q.question_id,
          );
          return (
            <div className="min-w-[200px] max-w-[280px] whitespace-normal text-sm">
              <AnswerValue value={ans?.answer_value ?? null} />
            </div>
          );
        },
      }),
    ),
  ];

  return (
    <div className="space-y-3">
      {questions.length === 0 && !p.loading ? (
        <p className="text-muted-foreground text-sm">
          No answers to show — this assessment has no attempts yet, or isn’t
          attached to this role.
        </p>
      ) : (
        <DataTable
          columns={columns}
          data={p.items}
          isLoading={p.loading && p.items.length === 0}
          isError={!!p.error}
          onRetry={p.retry}
          getRowHref={(row) => `/ats/applications/${row.application_id}`}
          emptyMessage="No applicants."
        />
      )}
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
