"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/status-badge";
import { ErrorState } from "@/components/states";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  ATTEMPT_STATUS,
  QUESTION_TYPE_LABELS,
  TEMPLATE_TYPE_LABELS,
} from "@/lib/constants";
import { formatDateTime } from "@/lib/utils/format";
import type { TemplateType } from "@/lib/types";
import { errorMessage } from "@/lib/api/client";
import * as applicationsService from "@/features/applications/applicationsService";
import type {
  ApplicationReview,
  AttemptReview,
} from "@/features/applications/schema";
import { useJobPost } from "@/features/job-posts/hooks";
import { AnswerValue } from "./_parts/answer-value";
import { ResumePreview } from "./_parts/resume-preview";

const TEMPLATE_ORDER: TemplateType[] = [
  "pre_assessment",
  "culture_fit",
  "technical",
];

const MAX_COMPARE = 4;

function fullName(a: ApplicationReview) {
  return `${a.applicant_first_name} ${a.applicant_last_name}`;
}

function duration(start: string | null, end: string | null) {
  if (!start || !end) return null;
  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (ms <= 0) return null;
  const mins = Math.round(ms / 60000);
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

export function CompareView({ jobId }: { jobId: string }) {
  const { job } = useJobPost(jobId);

  const [apps, setApps] = useState<ApplicationReview[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [appsError, setAppsError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [selected, setSelected] = useState<string[]>([]);
  const [reviews, setReviews] = useState<Record<string, AttemptReview[]>>({});

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const r = await applicationsService.listForReview(
          `job_post_id=${jobId}&size=100`,
        );
        if (!active) return;
        setApps(r.items);
        setSelected(r.items.slice(0, 3).map((a) => a.id));
        setAppsError(null);
      } catch (e) {
        if (active) setAppsError(errorMessage(e));
      } finally {
        if (active) setLoadingApps(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [jobId, reloadKey]);

  useEffect(() => {
    const missing = selected.filter((id) => !reviews[id]);
    if (missing.length === 0) return;
    let active = true;
    void (async () => {
      const pairs = await Promise.all(
        missing.map((id) =>
          applicationsService
            .getAssessmentsReview(id)
            .then((data) => [id, data] as const)
            .catch(() => [id, [] as AttemptReview[]] as const),
        ),
      );
      if (active)
        setReviews((prev) => ({ ...prev, ...Object.fromEntries(pairs) }));
    })();
    return () => {
      active = false;
    };
  }, [selected, reviews]);

  const loadingReviews = selected.some((id) => !reviews[id]);

  const selectedApps = useMemo(
    () => selected.map((id) => apps.find((a) => a.id === id)).filter(Boolean) as ApplicationReview[],
    [selected, apps],
  );

  const toggle = (id: string) =>
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length >= MAX_COMPARE
          ? prev
          : [...prev, id],
    );

  // Always show all 3 assessment types. `attached` says whether this job
  // post has a template of that type at all (vs a compared applicant just
  // not having an attempt).
  const attached: Record<TemplateType, boolean> = {
    pre_assessment: !!job?.pre_assessment_template_id,
    culture_fit: !!job?.culture_fit_template_id,
    technical: !!job?.technical_assessment_template_id,
  };

  const reviewFor = (appId: string, type: TemplateType) =>
    (reviews[appId] ?? []).find((r) => r.template_type === type);

  return (
    <div className="space-y-5">
      <Breadcrumbs
        items={[
          { label: "Job posts", href: "/ats/job-posts" },
          { label: job?.job_title ?? "Job post", href: `/ats/job-posts/${jobId}` },
          { label: "Compare applicants" },
        ]}
      />
      <Link
        href={`/ats/job-posts/${jobId}`}
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="size-4" /> Back to job post
      </Link>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Compare applicants
        </h1>
        <p className="text-muted-foreground text-sm">
          {job?.job_title ? `${job.job_title} · ` : ""}résumé and assessments side
          by side. Pick up to {MAX_COMPARE}.
        </p>
      </div>

      {appsError ? (
        <ErrorState message={appsError} onRetry={() => setReloadKey((k) => k + 1)} />
      ) : loadingApps ? (
        <Skeleton className="h-40 w-full" />
      ) : apps.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No one has applied to this job post yet.
        </p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {apps.map((a) => {
              const on = selected.includes(a.id);
              const disabled = !on && selected.length >= MAX_COMPARE;
              return (
                <label
                  key={a.id}
                  className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm ${
                    on ? "bg-accent" : ""
                  } ${disabled ? "opacity-40" : "cursor-pointer"}`}
                >
                  <Checkbox
                    checked={on}
                    disabled={disabled}
                    onCheckedChange={() => toggle(a.id)}
                  />
                  {fullName(a)}
                </label>
              );
            })}
          </div>

          {selectedApps.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Select applicants above to compare.
            </p>
          ) : (
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                {TEMPLATE_ORDER.map((t) => (
                  <TabsTrigger key={t} value={t}>
                    {TEMPLATE_TYPE_LABELS[t]}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="overview">
                <div className="overflow-x-auto rounded-lg border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="w-40 p-3 text-left font-medium" />
                        {selectedApps.map((a) => (
                          <th
                            key={a.id}
                            className="min-w-[220px] p-3 text-left align-top font-medium"
                          >
                            <Link
                              href={`/ats/applications/${a.id}`}
                              className="hover:underline"
                            >
                              {fullName(a)}
                            </Link>
                            <p className="text-muted-foreground text-xs font-normal">
                              {a.applicant_email}
                            </p>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-3 align-top font-medium">Résumé</td>
                        {selectedApps.map((a) => (
                          <td key={a.id} className="p-3 align-top">
                            <ResumePreview
                              applicationId={a.id}
                              applicantName={fullName(a)}
                            />
                          </td>
                        ))}
                      </tr>
                      {TEMPLATE_ORDER.map((t) => {
                        return (
                          <tr key={t} className="border-b last:border-0">
                            <td className="p-3 align-top font-medium">
                              {TEMPLATE_TYPE_LABELS[t]}
                              {!attached[t] ? (
                                <p className="text-muted-foreground text-xs font-normal">
                                  Not attached to this role
                                </p>
                              ) : null}
                            </td>
                            {selectedApps.map((a) => {
                              const r = reviewFor(a.id, t);
                              if (!r)
                                return (
                                  <td
                                    key={a.id}
                                    className="text-muted-foreground p-3 align-top text-xs"
                                  >
                                    {attached[t] ? "No attempt" : "—"}
                                  </td>
                                );
                              const meta = ATTEMPT_STATUS[r.status];
                              const dur = duration(r.started_at, r.completed_at);
                              return (
                                <td key={a.id} className="p-3 align-top">
                                  <div className="space-y-1">
                                    <StatusBadge
                                      label={meta.label}
                                      tone={meta.tone}
                                    />
                                    <p className="text-muted-foreground text-xs">
                                      {r.answered_count}/{r.total_questions}{" "}
                                      answered
                                      {dur ? ` · ${dur}` : ""}
                                      {r.reopen_count > 0
                                        ? ` · ${r.reopen_count}× reopened`
                                        : ""}
                                    </p>
                                    {r.completed_at ? (
                                      <p className="text-muted-foreground text-xs">
                                        {formatDateTime(r.completed_at)}
                                      </p>
                                    ) : null}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {loadingReviews ? (
                  <p className="text-muted-foreground mt-2 text-xs">Loading…</p>
                ) : null}
              </TabsContent>

              {TEMPLATE_ORDER.map((t) => {
                const base = selectedApps
                  .map((a) => reviewFor(a.id, t))
                  .find((r) => r && r.questions.length > 0);
                const questions = base?.questions ?? [];
                return (
                  <TabsContent key={t} value={t}>
                    <div className="overflow-x-auto rounded-lg border">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="w-72 p-3 text-left font-medium">
                              Question
                            </th>
                            {selectedApps.map((a) => (
                              <th
                                key={a.id}
                                className="min-w-[220px] p-3 text-left font-medium"
                              >
                                {fullName(a)}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {questions.length === 0 ? (
                            <tr>
                              <td
                                colSpan={selectedApps.length + 1}
                                className="text-muted-foreground p-3"
                              >
                                {attached[t]
                                  ? "No answers yet from the selected applicants."
                                  : "This assessment is not attached to this role."}
                              </td>
                            </tr>
                          ) : (
                            questions.map((q) => (
                              <tr
                                key={q.question_id}
                                className="border-b last:border-0"
                              >
                                <td className="p-3 align-top">
                                  <p className="font-medium">{q.prompt}</p>
                                  <p className="text-muted-foreground text-xs">
                                    {QUESTION_TYPE_LABELS[q.question_type]}
                                  </p>
                                </td>
                                {selectedApps.map((a) => {
                                  const r = reviewFor(a.id, t);
                                  const ans = r?.questions.find(
                                    (x) => x.question_id === q.question_id,
                                  );
                                  return (
                                    <td key={a.id} className="p-3 align-top">
                                      {r ? (
                                        <AnswerValue
                                          value={ans?.answer_value ?? null}
                                        />
                                      ) : (
                                        <span className="text-muted-foreground">
                                          no attempt
                                        </span>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </TabsContent>
                );
              })}
            </Tabs>
          )}
        </>
      )}
    </div>
  );
}
