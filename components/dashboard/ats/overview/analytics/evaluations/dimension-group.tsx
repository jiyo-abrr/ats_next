"use client";

import type { AnalyticsOverview } from "@/features/analytics/schema";
import { cn } from "@/lib/cn";

const dimensionLabels: Record<string, string> = {
  relevant_work_experience: "Relevant work experience",
  industry_experience: "Industry experience",
  employment_gap: "Employment gaps",
  tenure_stability: "Tenure stability",
  career_progression: "Career progression",
  job_hopping_risk: "Job-hopping risk",
  educational_background: "Education",
  certifications_licenses: "Certifications & licenses",
  technical_skills_match: "Technical skills match",
  pre_assessment: "Pre-assessment",
  culture_fit: "Culture fit",
  technical: "Technical assessment",
};

// Aligns with the Compare tab's rating vocabulary.
const RATING_STYLE = {
  strong: { label: "Strong", bar: "bg-emerald-500" },
  qualified: { label: "Qualified", bar: "bg-amber-500" },
  below_bar: { label: "Below bar", bar: "bg-red-500" },
  na: { label: "N/A", bar: "bg-muted-foreground/25" },
} as const;

/** Weighted lean of a dimension, for sorting strongest-first. */
function dimensionLean(d: {
  strong: number;
  qualified: number;
  below_bar: number;
}) {
  const rated = d.strong + d.qualified + d.below_bar;
  if (!rated) return -Infinity;
  return (d.strong + d.qualified * 0.5 - d.below_bar) / rated;
}

/** Evenly-spaced integer axis ticks from 0 up to (and including) max. */
function axisTicks(max: number): number[] {
  const top = Math.max(1, max);
  const step = top <= 6 ? 1 : Math.ceil(top / 4);
  const out: number[] = [];
  for (let value = 0; value <= top; value += step) out.push(value);
  if (out[out.length - 1] !== top) out.push(top);
  return out;
}

export function DimensionGroup({
  title,
  dimensions,
  max,
}: {
  title: string;
  dimensions: AnalyticsOverview["evaluations"]["score_dimensions"];
  max: number;
}) {
  if (dimensions.length === 0) return null;
  const sorted = [...dimensions].sort(
    (a, b) => dimensionLean(b) - dimensionLean(a),
  );
  const top = Math.max(1, max);
  const ticks = axisTicks(max);
  const PLOT_H = 148;
  const CLUSTER_W = 76;
  const GAP = 20;

  return (
    <div className="space-y-2">
      <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        {title}
      </p>
      <div className="flex gap-2 pt-2">
        <div
          className="relative w-4 shrink-0"
          style={{ height: PLOT_H }}
          aria-hidden
        >
          {ticks.map((tick) => (
            <span
              key={tick}
              className="text-muted-foreground absolute right-0 -translate-y-1/2 text-[10px] leading-none tabular-nums"
              style={{ bottom: `${(tick / top) * 100}%` }}
            >
              {tick}
            </span>
          ))}
        </div>
        <div className="min-w-0 flex-1 overflow-x-auto pb-1">
          <div
            className="relative w-max"
            style={{ height: PLOT_H, minWidth: "100%" }}
          >
            {ticks.map((tick) => (
              <span
                key={tick}
                aria-hidden
                className={cn(
                  "absolute inset-x-0 border-t",
                  tick === 0 ? "border-border" : "border-border/50",
                )}
                style={{ bottom: `${(tick / top) * 100}%` }}
              />
            ))}
            <div
              className="absolute inset-0 flex items-end"
              style={{ gap: GAP }}
            >
              {sorted.map((dimension) => (
                <DimensionCluster
                  key={`${dimension.category}-${dimension.dimension}`}
                  {...dimension}
                  max={top}
                  width={CLUSTER_W}
                />
              ))}
            </div>
          </div>
          <div
            className="mt-1.5 flex w-max"
            style={{ gap: GAP, minWidth: "100%" }}
          >
            {sorted.map((dimension) => (
              <span
                key={`${dimension.category}-${dimension.dimension}`}
                className="text-muted-foreground shrink-0 text-center text-[10px] leading-tight capitalize"
                style={{ width: CLUSTER_W }}
              >
                {dimensionLabels[dimension.dimension] ??
                  dimension.dimension.replaceAll("_", " ")}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * One dimension as a cluster of up to three bars — strong (emerald), qualified
 * (amber), below bar (red) — sharing the group's y-axis. Bars with a zero
 * count are dropped; N/A is omitted entirely.
 */
function DimensionCluster({
  dimension,
  strong,
  qualified,
  below_bar,
  na,
  max,
  width,
}: {
  category: string;
  dimension: string;
  strong: number;
  qualified: number;
  below_bar: number;
  na: number;
  max: number;
  width: number;
}) {
  const label = dimensionLabels[dimension] ?? dimension.replaceAll("_", " ");
  const bars = [
    { key: "strong", value: strong, className: RATING_STYLE.strong.bar },
    { key: "qualified", value: qualified, className: RATING_STYLE.qualified.bar },
    { key: "below_bar", value: below_bar, className: RATING_STYLE.below_bar.bar },
  ].filter((bar) => bar.value > 0);

  return (
    <div
      className="flex h-full shrink-0 items-end justify-center gap-1.5"
      style={{ width }}
      title={`${label} — ${strong} strong · ${qualified} qualified · ${below_bar} below bar${
        na ? ` · ${na} N/A` : ""
      }`}
    >
      {bars.length === 0 ? (
        <span className="text-muted-foreground/60 pb-1 text-[10px]">—</span>
      ) : (
        bars.map((bar) => (
          <div
            key={bar.key}
            className={cn("w-5 rounded-t-sm", bar.className)}
            style={{ height: `${(bar.value / max) * 100}%`, minHeight: "3px" }}
          />
        ))
      )}
    </div>
  );
}
