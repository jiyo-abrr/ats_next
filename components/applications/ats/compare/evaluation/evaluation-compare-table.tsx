"use client";

import { DataTablePagination } from "@/components/data-table/pagination";
import { StatusBadge } from "@/components/status-badge";
import * as applicationsService from "@/features/applications/applicationsService";
import type { JobEvaluationRow } from "@/features/applications/schema";
import Link from "next/link";
import { RECOMMENDATION_LABELS } from "../shared/constants";
import { usePaged } from "../shared/use-paged";

const RATING_META: Record<
  string,
  { label: string; tone: "success" | "warning" | "danger" | "neutral" }
> = {
  strong: { label: "Strong", tone: "success" },
  qualified: { label: "Qualified", tone: "warning" },
  below_bar: { label: "Below bar", tone: "danger" },
  na: { label: "N/A", tone: "neutral" },
};

const RESUME_DIMS = [
  "relevant_work_experience",
  "industry_experience",
  "employment_gap",
  "tenure_stability",
  "career_progression",
  "job_hopping_risk",
  "educational_background",
  "certifications_licenses",
  "technical_skills_match",
];

const ASSESSMENT_DIMS = ["pre_assessment", "culture_fit", "technical"];

function prettyDim(d: string) {
  return d.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function EvaluationCompareTable({ jobId }: { jobId: string }) {
  const p = usePaged<JobEvaluationRow>((qs) =>
    applicationsService.getJobEvaluations(`job_post_id=${jobId}&${qs}`),
  );

  const rated = p.items.filter((r) => r.evaluation);
  if (!p.loading && rated.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No AI evaluations imported yet. Export the pack, run it through ChatGPT,
        then import the results CSV.
      </p>
    );
  }

  const cell = (r: JobEvaluationRow, category: string, dim: string) => {
    const score = r.evaluation?.scores.find(
      (s) => s.category === category && s.dimension === dim,
    );
    if (!score) return <span className="text-muted-foreground text-xs">—</span>;
    const m = RATING_META[score.rating] ?? RATING_META.na;
    return (
      <div className="space-y-1">
        <StatusBadge label={m.label} tone={m.tone} />
        {score.reason ? (
          <p className="text-muted-foreground text-xs leading-snug">
            {score.reason}
          </p>
        ) : null}
      </div>
    );
  };

  const section = (title: string, category: string, dims: string[]) => (
    <>
      <tr className="bg-muted/40">
        <td
          className="p-2 text-xs font-semibold tracking-wide uppercase"
          colSpan={p.items.length + 1}
        >
          {title}
        </td>
      </tr>
      {dims.map((dim) => (
        <tr key={dim} className="border-b last:border-0">
          <td className="p-2 align-top font-medium">{prettyDim(dim)}</td>
          {p.items.map((r) => (
            <td key={r.application_id} className="p-2 align-top">
              {cell(r, category, dim)}
            </td>
          ))}
        </tr>
      ))}
    </>
  );

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="w-52 p-2 text-left font-medium">Applicant</th>
              {p.items.map((r) => {
                const e = r.evaluation;
                const rec = e?.recommendation
                  ? RECOMMENDATION_LABELS[e.recommendation]
                  : null;
                const tone =
                  e?.recommendation === "advance"
                    ? "success"
                    : e?.recommendation === "reject"
                      ? "danger"
                      : "warning";
                return (
                  <th
                    key={r.application_id}
                    className="min-w-[220px] p-2 text-left align-top font-medium"
                  >
                    <Link
                      href={`/ats/applications/${r.application_id}`}
                      className="hover:underline"
                    >
                      {r.applicant_first_name} {r.applicant_last_name}
                    </Link>
                    <div className="mt-1 flex flex-wrap items-center gap-1 font-normal">
                      {rec ? <StatusBadge label={rec} tone={tone} /> : null}
                      {e?.fit_score != null ? (
                        <span className="text-muted-foreground text-xs">
                          {e.fit_score}/100
                        </span>
                      ) : null}
                    </div>
                    {e?.seniority_assessed ? (
                      <p className="text-muted-foreground text-xs font-normal">
                        {e.seniority_assessed}
                      </p>
                    ) : null}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {p.items.some((r) => r.evaluation?.summary) ? (
              <tr className="border-b">
                <td className="p-2 align-top font-medium">Summary</td>
                {p.items.map((r) => (
                  <td
                    key={r.application_id}
                    className="text-muted-foreground p-2 align-top text-xs"
                  >
                    {r.evaluation?.summary ?? "—"}
                  </td>
                ))}
              </tr>
            ) : null}
            {section("Résumé", "resume", RESUME_DIMS)}
            {section("Assessments", "assessment", ASSESSMENT_DIMS)}
          </tbody>
        </table>
      </div>
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
