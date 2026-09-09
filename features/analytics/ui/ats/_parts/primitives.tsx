"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { APPLICATION_STATUS } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/utils/format";
import type {
  AnalyticsActivityPoint,
  AnalyticsStatusCount,
} from "@/features/analytics/schema";

export function number(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export function percent(value: number) {
  return `${value.toFixed(value % 1 ? 1 : 0)}%`;
}

export function minutes(value: number | null) {
  if (value === null) return "—";
  return value < 60 ? `${value} min` : `${(value / 60).toFixed(1)} hr`;
}

export function statusCount(counts: AnalyticsStatusCount[], key: string) {
  return counts.find((item) => item.key === key)?.count ?? 0;
}

export function MetricGrid({
  metrics,
  className,
}: {
  metrics: [label: string, value: string, hint: string][];
  className?: string;
}) {
  return (
    <div className={cn("grid gap-3 sm:grid-cols-2 xl:grid-cols-4", className)}>
      {metrics.map(([label, value, hint]) => (
        <Card key={label} size="sm">
          <CardContent>
            <p className="text-muted-foreground text-xs">{label}</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
            <p className="text-muted-foreground mt-1 text-xs">{hint}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function HeroDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-primary-foreground/15 bg-primary-foreground/10 rounded-lg border px-3 py-2">
      <p className="text-primary-foreground/65 text-xs">{label}</p>
      <p className="mt-1 font-semibold tabular-nums">{value}</p>
    </div>
  );
}

export function AttentionLink({
  href,
  label,
  value,
}: {
  href: string;
  label: string;
  value: number;
}) {
  return (
    <Link
      href={href}
      className="hover:bg-muted -mx-1 flex items-center justify-between rounded-md px-1 py-2 transition-colors"
    >
      <span className="text-sm">{label}</span>
      <span className="flex items-center gap-2 text-sm font-medium tabular-nums">
        {number(value)}
        <ArrowUpRight className="text-muted-foreground size-3.5" />
      </span>
    </Link>
  );
}

export function ActivityBars({
  points,
  compact = false,
}: {
  points: AnalyticsActivityPoint[];
  compact?: boolean;
}) {
  if (!points.length) {
    return <EmptyMessage message="No activity in this period." />;
  }
  const max = Math.max(...points.map((point) => point.count), 1);
  return (
    <div className="overflow-x-auto">
      <div
        className={cn("flex h-44 items-end gap-1", compact && "h-32")}
        style={{ minWidth: `${points.length * 0.75}rem` }}
      >
        {points.map((point) => (
          <div
            key={point.date}
            className="group relative flex min-w-2.5 flex-1 flex-col justify-end"
          >
            <div
              className="bg-primary/85 group-hover:bg-primary min-h-1 rounded-t-sm transition-[height]"
              style={{
                height: `${Math.max((point.count / max) * 100, 3)}%`,
              }}
            />
            <span className="bg-popover text-popover-foreground pointer-events-none absolute -top-7 left-1/2 hidden -translate-x-1/2 rounded px-1.5 py-1 text-[10px] whitespace-nowrap shadow group-hover:block">
              {formatDate(point.date)} · {number(point.count)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function StatusBars({
  counts,
  total,
  labels = APPLICATION_STATUS,
}: {
  counts: AnalyticsStatusCount[];
  total: number;
  labels?: Record<string, { label: string } | string>;
}) {
  return (
    <div className="space-y-3">
      {counts.map((item) => {
        const entry = labels[item.key];
        const label =
          typeof entry === "string" ? entry : (entry?.label ?? item.key);
        return (
          <ProgressRow
            key={item.key}
            label={label}
            value={item.count}
            total={total}
          />
        );
      })}
    </div>
  );
}

export function ProgressRow({
  label,
  value,
  total,
}: {
  label: string;
  value: number;
  total: number;
}) {
  const width = total ? Math.max((value / total) * 100, value ? 4 : 0) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between gap-3 text-xs">
        <span className="text-muted-foreground truncate">{label}</span>
        <span className="font-medium tabular-nums">{number(value)}</span>
      </div>
      <div className="bg-muted h-2 overflow-hidden rounded-full">
        <div
          className="bg-primary h-full rounded-full"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

export function EmptyMessage({ message }: { message: string }) {
  return (
    <p className="text-muted-foreground py-6 text-center text-sm">{message}</p>
  );
}
