"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/pagination";
import { StatusBadge } from "@/components/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ATTEMPT_STATUS,
  QUESTION_TYPE_LABELS,
  TEMPLATE_TYPE_LABELS,
} from "@/lib/constants";
import type { TemplateType } from "@/lib/types";
import { toast } from "@/lib/utils/toast";
import { errorMessage } from "@/lib/api/client";
import * as applicationsService from "@/features/applications/applicationsService";
import { resumeBlob } from "@/features/applications/applicationsService";
import type {
  ApplicationScorecard,
  JobAssessmentReviewRow,
} from "@/features/applications/schema";
import { useJobPost } from "@/features/job-posts/hooks";
import { AnswerValue } from "./_parts/answer-value";
import type { ColumnDef } from "@tanstack/react-table";

const TEMPLATE_ORDER: TemplateType[] = [
  "pre_assessment",
  "culture_fit",
  "technical",
];

function duration(start: string | null, end: string | null) {
  if (!start || !end) return null;
  const mins = Math.round(
    (new Date(end).getTime() - new Date(start).getTime()) / 60000,
  );
  if (mins <= 0) return null;
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

function applicantName(a: { first: string; last: string }) {
  return `${a.first} ${a.last}`;
}

function ResumeCell({ id, name }: { id: string; name: string }) {
  const [busy, setBusy] = useState(false);
  const withBlob = async (fn: (url: string) => void) => {
    setBusy(true);
    try {
      fn(URL.createObjectURL(await resumeBlob(id)));
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="flex gap-1">
      <Button
        variant="outline"
        size="sm"
        className="h-7 px-2 text-xs"
        disabled={busy}
        onClick={(e) => {
          e.stopPropagation();
          withBlob((url) => window.open(url, "_blank", "noopener"));
        }}
      >
        <Eye className="size-3" /> View
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="h-7 px-2 text-xs"
        disabled={busy}
        onClick={(e) => {
          e.stopPropagation();
          withBlob((url) => {
            const a = document.createElement("a");
            a.href = url;
            a.download = `${name.replace(/\s+/g, "_")}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
          });
        }}
      >
        <Download className="size-3" /> PDF
      </Button>
    </div>
  );
}

/** Shared local-pagination fetch for both scorecard + per-assessment tables. */
function usePaged<T>(fetcher: (qs: string) => Promise<{
  items: T[];
  total: number;
  pages: number;
}>) {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(25);
  const [state, setState] = useState<{
    items: T[];
    total: number;
    pages: number;
    loading: boolean;
    error: string | null;
  }>({ items: [], total: 0, pages: 0, loading: true, error: null });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const r = await fetcher(`page=${page}&size=${size}`);
        if (!active) return;
        setState({
          items: r.items,
          total: r.total,
          pages: r.pages,
          loading: false,
          error: null,
        });
      } catch (e) {
        if (active)
          setState((s) => ({ ...s, loading: false, error: errorMessage(e) }));
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size, reloadKey]);

  return {
    ...state,
    page,
    size,
    setPage,
    setSize,
    retry: () => setReloadKey((k) => k + 1),
  };
}

function ScorecardTable({ jobId }: { jobId: string }) {
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

function AssessmentAnswersTable({
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

export function CompareView({ jobId }: { jobId: string }) {
  return (
    <div className="space-y-4">
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {TEMPLATE_ORDER.map((t) => (
            <TabsTrigger key={t} value={t}>
              {TEMPLATE_TYPE_LABELS[t]}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="pt-3">
          <p className="text-muted-foreground mb-3 text-sm">
            Every applicant’s résumé and assessment progress. Open a row for the
            full review.
          </p>
          <ScorecardTable jobId={jobId} />
        </TabsContent>

        {TEMPLATE_ORDER.map((t) => (
          <TabsContent key={t} value={t} className="pt-3">
            <p className="text-muted-foreground mb-3 text-sm">
              Every applicant’s answers to the {TEMPLATE_TYPE_LABELS[t]}{" "}
              assessment, side by side.
            </p>
            <div className="overflow-x-auto">
              <AssessmentAnswersTable jobId={jobId} templateType={t} />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
