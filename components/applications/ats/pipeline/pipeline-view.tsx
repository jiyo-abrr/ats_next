"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/pagination";
import { StatusBadge } from "@/components/status-badge";
import { APPLICATION_STATUS } from "@/lib/constants";
import { formatDate } from "@/lib/utils/format";
import { cn } from "@/lib/cn";
import type { ApplicationStatus } from "@/lib/types";
import { toast } from "@/lib/utils/toast";
import { useAppDispatch } from "@/lib/hooks/redux";
import { changeApplicationStatus } from "@/lib/store/applicationsSlice";
import * as applicationsService from "@/features/applications/applicationsService";
import { getInterviewStatuses } from "@/features/interviews/interviewsService";
import type { InterviewStatus } from "@/features/interviews/schema";
import {
  PIPELINE_STAGES,
  useJobPipelineStage,
} from "@/features/applications/hooks";
import type { ApplicationReview } from "@/features/applications/schema";
import type { ColumnDef } from "@tanstack/react-table";

const REJECTIONS = new Set<ApplicationStatus>(["denied", "failed"]);
const EMPTY: Set<string> = new Set();

function stageCount(byStatus: Record<string, number>, key: string) {
  switch (key) {
    case "applied":
      return byStatus.applied ?? 0;
    case "prescreening":
      return byStatus.prescreening ?? 0;
    case "interview":
      return byStatus.interview ?? 0;
    case "hired":
      return byStatus.success ?? 0;
    case "closed":
      return (
        (byStatus.denied ?? 0) +
        (byStatus.failed ?? 0) +
        (byStatus.disqualified ?? 0) +
        (byStatus.withdrawn ?? 0)
      );
    default:
      return 0;
  }
}

export function PipelineView({ jobId }: { jobId: string }) {
  const dispatch = useAppDispatch();
  const {
    data,
    total,
    pages,
    loading,
    error,
    query,
    stage,
    setStage,
    setPage,
    setSize,
    refetch,
  } = useJobPipelineStage(jobId);

  const [counts, setCounts] = useState<Record<string, number>>({});
  const [acting, setActing] = useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [interviewStatus, setInterviewStatus] = useState<
    Record<string, InterviewStatus>
  >({});

  useEffect(() => {
    if (stage !== "interview") return;
    let active = true;
    void getInterviewStatuses(jobId)
      .then((rows) => {
        if (active)
          setInterviewStatus(
            Object.fromEntries(rows.map((r) => [r.application_id, r])),
          );
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [stage, jobId, data]);

  // Selection is scoped to the current stage + page; a stale-keyed selection
  // reads as empty (no effect needed to clear it on navigation).
  const selKey = `${stage}|${query.page}|${query.size}`;
  const [sel, setSel] = useState<{ key: string; ids: Set<string> }>({
    key: selKey,
    ids: new Set(),
  });
  const selected = sel.key === selKey ? sel.ids : EMPTY;
  const setSelected = (ids: Set<string>) => setSel({ key: selKey, ids });

  const loadCounts = useCallback(() => {
    applicationsService
      .stats(jobId)
      .then((r) => setCounts(r.by_status))
      .catch(() => undefined);
  }, [jobId]);

  useEffect(loadCounts, [loadCounts]);

  const toggleRow = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const allOnPageSelected = data.length > 0 && data.every((r) => selected.has(r.id));
  const toggleAll = () =>
    setSelected(allOnPageSelected ? new Set() : new Set(data.map((r) => r.id)));

  const move = async (id: string, status: ApplicationStatus) => {
    setActing(id);
    try {
      await dispatch(changeApplicationStatus({ id, status })).unwrap();
      toast.success(`Moved to ${APPLICATION_STATUS[status].label}`);
      refetch();
      loadCounts();
    } catch {
      /* handled by toast middleware */
    } finally {
      setActing(null);
    }
  };

  const selectedRows = useMemo(
    () => data.filter((r) => selected.has(r.id)),
    [data, selected],
  );

  // Only transitions valid for *every* selected applicant.
  const commonTransitions = useMemo(() => {
    if (selectedRows.length === 0) return [] as ApplicationStatus[];
    return selectedRows
      .map((r) => new Set(r.allowed_status_transitions))
      .reduce<ApplicationStatus[]>(
        (acc, set) => acc.filter((t) => set.has(t)),
        [...selectedRows[0].allowed_status_transitions],
      );
  }, [selectedRows]);

  const bulkMove = async (status: ApplicationStatus) => {
    const ids = selectedRows.map((r) => r.id);
    setBulkBusy(true);
    const results = await Promise.allSettled(
      ids.map((id) => applicationsService.updateStatus(id, status)),
    );
    setBulkBusy(false);
    const ok = results.filter((r) => r.status === "fulfilled").length;
    if (ok > 0) toast.success(`Moved ${ok} to ${APPLICATION_STATUS[status].label}`);
    if (ok < ids.length) toast.error(`${ids.length - ok} could not be moved`);
    setSelected(new Set());
    refetch();
    loadCounts();
  };

  const columns: ColumnDef<ApplicationReview, unknown>[] = [
    {
      id: "select",
      header: () => (
        <Checkbox
          checked={allOnPageSelected}
          onCheckedChange={toggleAll}
          aria-label="Select all on this page"
          disabled={data.length === 0}
        />
      ),
      meta: { className: "w-10" },
      cell: ({ row }) => (
        <Checkbox
          checked={selected.has(row.original.id)}
          onCheckedChange={() => toggleRow(row.original.id)}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Select ${row.original.applicant_first_name}`}
        />
      ),
    },
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
    ...(stage === "interview"
      ? [
          {
            id: "interview",
            header: "Interview",
            meta: { className: "w-40" },
            cell: ({ row }) => {
              const s = interviewStatus[row.original.id];
              if (!s)
                return (
                  <span className="text-muted-foreground text-xs">
                    Not scheduled
                  </span>
                );
              if (s.state === "confirmed")
                return (
                  <span className="text-xs tabular-nums">
                    {s.starts_at ? formatDate(s.starts_at) : "Confirmed"}
                  </span>
                );
              return <StatusBadge label="Awaiting candidate" tone="warning" />;
            },
          } as ColumnDef<ApplicationReview, unknown>,
        ]
      : []),
    {
      id: "actions",
      header: "",
      meta: { className: "w-64" },
      cell: ({ row }) => {
        const transitions = row.original.allowed_status_transitions;
        if (transitions.length === 0) return null;
        const busy = acting === row.original.id;
        return (
          <div className="flex flex-wrap justify-end gap-1">
            {transitions.map((t) => {
              const meta = APPLICATION_STATUS[t];
              if (REJECTIONS.has(t)) {
                return (
                  <ConfirmDialog
                    key={t}
                    trigger={
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        disabled={busy}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {meta.label}
                      </Button>
                    }
                    title={`Mark this application ${meta.label.toLowerCase()}?`}
                    description="This is a terminal decision and can't be undone."
                    destructive
                    confirmLabel={meta.label}
                    onConfirm={() => move(row.original.id, t)}
                  />
                );
              }
              return (
                <Button
                  key={t}
                  size="sm"
                  variant="secondary"
                  className="h-7 px-2 text-xs"
                  disabled={busy}
                  onClick={(e) => {
                    e.stopPropagation();
                    move(row.original.id, t);
                  }}
                >
                  {meta.label} <ArrowRight className="size-3" />
                </Button>
              );
            })}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1">
        {PIPELINE_STAGES.map((s) => {
          const active = s.key === stage;
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => setStage(s.key)}
              className={cn(
                "inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm",
                active
                  ? "border-primary bg-primary/5 font-medium"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {s.label}
              <span
                className={cn(
                  "rounded-full px-1.5 text-xs",
                  active ? "bg-primary/15" : "bg-muted",
                )}
              >
                {stageCount(counts, s.key)}
              </span>
            </button>
          );
        })}
      </div>

      {selected.size > 0 ? (
        <div className="bg-muted/50 flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2 text-sm">
          <span className="font-medium">{selected.size} selected</span>
          <div className="ml-auto flex flex-wrap gap-1">
            {commonTransitions.length === 0 ? (
              <span className="text-muted-foreground text-xs">
                No shared action for this selection
              </span>
            ) : (
              commonTransitions.map((t) => {
                const meta = APPLICATION_STATUS[t];
                return REJECTIONS.has(t) ? (
                  <ConfirmDialog
                    key={t}
                    trigger={
                      <Button variant="ghost" size="sm" disabled={bulkBusy}>
                        {meta.label}
                      </Button>
                    }
                    title={`Mark ${selected.size} applications ${meta.label.toLowerCase()}?`}
                    description="This is a terminal decision and can't be undone."
                    destructive
                    confirmLabel={`${meta.label} ${selected.size}`}
                    onConfirm={() => bulkMove(t)}
                  />
                ) : (
                  <Button
                    key={t}
                    size="sm"
                    disabled={bulkBusy}
                    onClick={() => bulkMove(t)}
                  >
                    Move to {meta.label} <ArrowRight className="size-3" />
                  </Button>
                );
              })
            )}
            <Button
              variant="ghost"
              size="sm"
              disabled={bulkBusy}
              onClick={() => setSelected(new Set())}
            >
              Clear
            </Button>
          </div>
        </div>
      ) : null}

      <DataTable
        columns={columns}
        data={data}
        isLoading={loading && data.length === 0}
        isError={!!error}
        onRetry={refetch}
        getRowHref={(row) => `/ats/applications/${row.id}`}
        emptyMessage="No applicants at this stage."
      />

      <DataTablePagination
        page={query.page}
        size={query.size}
        total={total}
        pages={pages}
        onPageChange={setPage}
        onSizeChange={setSize}
        isLoading={loading}
      />
    </div>
  );
}
