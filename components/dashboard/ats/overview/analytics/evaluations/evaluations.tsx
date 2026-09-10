"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalyticsOverview } from "@/features/analytics/schema";
import { cn } from "@/lib/cn";
import { ActivityBars, EmptyMessage, MetricGrid, StatusBars, number, percent, statusCount } from "../primitives";
import { DimensionGroup } from "./dimension-group";
import { RatingLegend } from "./rating-legend";
import { StackedBar } from "./stacked-bar";

const RECOMMENDATION_ROWS = [
  { key: "advance", label: "Advance", bar: "bg-emerald-500" },
  { key: "hold", label: "Hold", bar: "bg-amber-500" },
  { key: "reject", label: "Reject", bar: "bg-red-500" },
] as const;

const fitBandLabels: Record<string, string> = {
  "0-49": "0–49",
  "50-69": "50–69",
  "70-84": "70–84",
  "85-100": "85–100",
};

export function Evaluations({ data }: { data: AnalyticsOverview }) {
  const evaluations = data.evaluations;
  const evaluated = evaluations.evaluated_applications;
  const advance = statusCount(evaluations.recommendations, "advance");
  const resumeDimensions = evaluations.score_dimensions.filter(
    (d) => d.category === "resume",
  );
  const assessmentDimensions = evaluations.score_dimensions.filter(
    (d) => d.category === "assessment",
  );

  if (evaluated === 0) {
    return (
      <Card size="sm">
        <CardContent className="py-10 text-center">
          <p className="text-sm font-medium">No evaluations yet</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Export an evaluation pack from a job post&apos;s Compare tab, run it
            through the AI, then import the results.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <MetricGrid
        metrics={[
          [
            "Evaluated",
            number(evaluated),
            `${percent(evaluations.evaluation_coverage_rate)} of all applications`,
          ],
          [
            "Average fit",
            evaluations.average_fit_score?.toFixed(1) ?? "—",
            "out of 100",
          ],
          [
            "Advance rate",
            percent(evaluated ? (advance / evaluated) * 100 : 0),
            `${number(advance)} of ${number(evaluated)}`,
          ],
          [
            "Imported",
            number(
              evaluations.evaluation_activity.reduce(
                (sum, point) => sum + point.count,
                0,
              ),
            ),
            "in this period",
          ],
        ]}
      />

      <div className="grid gap-3 lg:grid-cols-2">
        <Card size="sm">
          <CardHeader>
            <CardTitle>Recommendation mix</CardTitle>
            <p className="text-muted-foreground text-xs">
              Latest AI recommendation per application.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <StackedBar
              segments={RECOMMENDATION_ROWS.map((row) => ({
                value: statusCount(evaluations.recommendations, row.key),
                className: row.bar,
                label: row.label,
              }))}
            />
            <div className="space-y-2.5">
              {RECOMMENDATION_ROWS.map((row) => {
                const count = statusCount(evaluations.recommendations, row.key);
                const pct = evaluated ? (count / evaluated) * 100 : 0;
                return (
                  <div key={row.key} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5">
                        <span
                          className={cn("size-2 rounded-full", row.bar)}
                        />
                        {row.label}
                      </span>
                      <span className="tabular-nums">
                        <span className="font-medium">{number(count)}</span>
                        <span className="text-muted-foreground">
                          {" "}
                          &middot; {percent(pct)}
                        </span>
                      </span>
                    </div>
                    <div className="bg-muted h-1.5 overflow-hidden rounded-full">
                      <div
                        className={cn("h-full rounded-full", row.bar)}
                        style={{
                          width: `${Math.max(pct, count ? 4 : 0)}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardTitle>Fit-score distribution</CardTitle>
            <p className="text-muted-foreground text-xs">
              Latest score for each evaluated application.
            </p>
          </CardHeader>
          <CardContent>
            <StatusBars
              counts={evaluations.fit_score_bands}
              total={evaluated}
              labels={fitBandLabels}
            />
          </CardContent>
        </Card>
      </div>

      <Card size="sm">
        <CardHeader className="gap-2">
          <CardTitle>Dimension ratings</CardTitle>
          <p className="text-muted-foreground text-xs">
            Applicants at each rating per dimension, ordered strongest first.
            N/A ratings are left out, so a group may not sum to{" "}
            {number(evaluated)}.
          </p>
          <RatingLegend />
        </CardHeader>
        <CardContent className="space-y-5">
          {evaluations.score_dimensions.length === 0 ? (
            <EmptyMessage message="The imported evaluations have no dimension scores." />
          ) : (
            <>
              <DimensionGroup
                title="Résumé"
                dimensions={resumeDimensions}
                max={evaluated}
              />
              <DimensionGroup
                title="Assessments"
                dimensions={assessmentDimensions}
                max={evaluated}
              />
              <p className="text-muted-foreground border-t pt-3 text-xs">
                <span className="text-foreground font-medium">Basis:</span>{" "}
                the latest AI evaluation imported for each of the{" "}
                {number(evaluated)} evaluated applicant
                {evaluated === 1 ? "" : "s"} — résumé rubric and assessment
                answers scored as Strong / Qualified / Below bar by the external
                AI on the Compare tab, then imported as CSV. Counts are
                all-time and follow the position filter above.
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader>
          <CardTitle>Evaluation activity</CardTitle>
          <p className="text-muted-foreground text-xs">
            Evaluations imported during the selected period.
          </p>
        </CardHeader>
        <CardContent>
          <ActivityBars points={evaluations.evaluation_activity} compact />
        </CardContent>
      </Card>
    </div>
  );
}
