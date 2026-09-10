"use client";

import { cn } from "@/lib/cn";

/** A single proportional bar built from labelled segments. */
export function StackedBar({
  segments,
}: {
  segments: { value: number; className: string; label: string }[];
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  return (
    <div className="bg-muted flex h-2.5 w-full overflow-hidden rounded-full">
      {total > 0 &&
        segments.map((seg) =>
          seg.value ? (
            <div
              key={seg.label}
              className={cn("h-full", seg.className)}
              style={{ width: `${(seg.value / total) * 100}%` }}
              title={`${seg.label}: ${seg.value}`}
            />
          ) : null,
        )}
    </div>
  );
}
