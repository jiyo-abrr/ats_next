"use client";

import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { formatDateTime } from "@/lib/utils/format";
import { getApplicationEvaluation } from "@/features/applications/applicationsService";
import type { ApplicationEvaluation } from "@/features/applications/schema";

type Meta = { label: string; tone: "success" | "warning" | "danger" | "neutral" };

const RATING: Record<string, Meta> = {
  strong: { label: "Strong", tone: "success" },
  qualified: { label: "Qualified", tone: "warning" },
  below_bar: { label: "Below bar", tone: "danger" },
  na: { label: "N/A", tone: "neutral" },
};
const REC: Record<string, Meta> = {
  advance: { label: "Advance", tone: "success" },
  hold: { label: "Hold", tone: "warning" },
  reject: { label: "Reject", tone: "danger" },
};

function prettyDimension(d: string) {
  return d.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function EvaluationCard({ applicationId }: { applicationId: string }) {
  const [evaluation, setEvaluation] = useState<ApplicationEvaluation | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    void getApplicationEvaluation(applicationId)
      .then((e) => active && setEvaluation(e))
      .catch(() => undefined)
      .finally(() => active && setLoaded(true));
    return () => {
      active = false;
    };
  }, [applicationId]);

  if (!loaded || !evaluation) return null;

  const rows = (category: "resume" | "assessment") =>
    evaluation.scores.filter((s) => s.category === category);

  const rec = evaluation.recommendation
    ? (REC[evaluation.recommendation] ?? null)
    : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2">
          AI evaluation
          {rec ? <StatusBadge label={rec.label} tone={rec.tone} /> : null}
          {evaluation.fit_score !== null ? (
            <span className="text-muted-foreground text-sm font-normal">
              Fit {evaluation.fit_score}/100
            </span>
          ) : null}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <p className="text-muted-foreground text-xs">
          {[
            evaluation.model,
            evaluation.seniority_assessed
              ? `assessed as ${evaluation.seniority_assessed}`
              : null,
            `imported ${formatDateTime(evaluation.created_at)}`,
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>

        {evaluation.summary ? <p>{evaluation.summary}</p> : null}

        {(["resume", "assessment"] as const).map((cat) => {
          const scores = rows(cat);
          if (scores.length === 0) return null;
          return (
            <div key={cat}>
              <p className="mb-1 text-xs font-medium tracking-wide uppercase">
                {cat === "resume" ? "Résumé" : "Assessments"}
              </p>
              <div className="overflow-hidden rounded-md border">
                <table className="w-full">
                  <tbody>
                    {scores.map((s) => {
                      const r = RATING[s.rating] ?? RATING.na;
                      return (
                        <tr key={s.dimension} className="border-b last:border-0">
                          <td className="p-2 align-top font-medium">
                            {prettyDimension(s.dimension)}
                          </td>
                          <td className="w-28 p-2 align-top">
                            <StatusBadge label={r.label} tone={r.tone} />
                          </td>
                          <td className="text-muted-foreground p-2 align-top text-xs">
                            {s.reason}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
