"use client";

import { cn } from "@/lib/cn";
import type { AvailabilityWindow } from "@/features/interviews/schema";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOUR_PX = 40;

function toMin(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}
function label(hour: number) {
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12} ${hour < 12 || hour === 24 ? "AM" : "PM"}`;
}

/** Read-only week grid that mirrors the availability windows — the "Calendly
 * calendar" glance. Updates live as the editor changes. */
export function WeekPreview({ windows }: { windows: AvailabilityWindow[] }) {
  const starts = windows.map((w) => toMin(w.start));
  const ends = windows.map((w) => toMin(w.end));
  const startHour = Math.max(
    0,
    Math.min(8, ...starts.map((m) => Math.floor(m / 60))),
  );
  const endHour = Math.min(
    24,
    Math.max(18, ...ends.map((m) => Math.ceil(m / 60))),
  );
  const spanMin = (endHour - startHour) * 60;
  const bodyHeight = (endHour - startHour) * HOUR_PX;
  const hours = Array.from(
    { length: endHour - startHour + 1 },
    (_, i) => startHour + i,
  );

  const pct = (min: number) => ((min - startHour * 60) / spanMin) * 100;

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[640px]">
        {/* day headers */}
        <div className="grid grid-cols-[3rem_repeat(7,1fr)] border-b">
          <div />
          {DAYS.map((d, i) => (
            <div
              key={d}
              className={cn(
                "px-2 pb-2 text-center text-xs font-medium",
                i >= 5 ? "text-muted-foreground" : "text-foreground",
              )}
            >
              {d}
            </div>
          ))}
        </div>

        {/* grid body */}
        <div
          className="grid grid-cols-[3rem_repeat(7,1fr)]"
          style={{ height: bodyHeight }}
        >
          {/* hour gutter */}
          <div className="relative">
            {hours.map((h, i) => (
              <span
                key={h}
                className="text-muted-foreground absolute right-1.5 -translate-y-1/2 text-[10px] tabular-nums"
                style={{ top: (i / (hours.length - 1)) * 100 + "%" }}
              >
                {i === 0 ? "" : label(h)}
              </span>
            ))}
          </div>

          {/* 7 day columns */}
          {DAYS.map((d, day) => (
            <div
              key={d}
              className={cn(
                "relative border-l",
                day >= 5 && "bg-muted/30",
              )}
            >
              {/* hour lines */}
              {hours.slice(1).map((h, i) => (
                <span
                  key={h}
                  className="border-border/50 absolute inset-x-0 border-t"
                  style={{ top: ((i + 1) / (hours.length - 1)) * 100 + "%" }}
                  aria-hidden
                />
              ))}
              {/* availability blocks */}
              {windows
                .filter((w) => w.weekday === day)
                .map((w, i) => (
                  <div
                    key={i}
                    className="absolute inset-x-1 rounded-md border border-emerald-500/40 bg-emerald-500/15 px-1.5 py-0.5 text-[10px] leading-tight font-medium text-emerald-700 dark:text-emerald-300"
                    style={{
                      top: `${pct(toMin(w.start))}%`,
                      height: `${pct(toMin(w.end)) - pct(toMin(w.start))}%`,
                    }}
                  >
                    {w.start}–{w.end}
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
