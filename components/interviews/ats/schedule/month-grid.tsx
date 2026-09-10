"use client";

import { useRouter } from "next/navigation";

import { cn } from "@/lib/cn";
import type { UpcomingInterview } from "@/features/interviews/schema";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/** Monday-first 6×7 month grid. Each cell shows up to 3 interview pills. */
export function MonthGrid({
  month,
  events,
  onDayClick,
}: {
  month: Date;
  events: UpcomingInterview[];
  onDayClick: (date: Date) => void;
}) {
  const router = useRouter();
  const now = new Date();

  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - ((first.getDay() + 6) % 7)); // back to Monday
  const cells = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return d;
  });

  const eventsFor = (day: Date) =>
    events
      .map((e) => ({ e, start: new Date(e.starts_at) }))
      .filter((x) => sameDay(x.start, day))
      .sort((a, b) => a.start.getTime() - b.start.getTime());

  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="bg-muted/40 grid grid-cols-7 border-b text-center">
        {WEEKDAYS.map((d, i) => (
          <div
            key={d}
            className={cn(
              "py-2 text-xs font-medium",
              i >= 5 ? "text-muted-foreground" : "text-foreground",
            )}
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          const inMonth = day.getMonth() === month.getMonth();
          const isToday = sameDay(day, now);
          const dayEvents = eventsFor(day);
          return (
            <button
              key={i}
              type="button"
              onClick={() => onDayClick(day)}
              className={cn(
                "hover:bg-muted/50 flex min-h-[7rem] flex-col gap-1 border-r border-b p-1.5 text-left transition-colors last:border-r-0 [&:nth-child(7n)]:border-r-0",
                i >= 35 && "border-b-0",
                !inMonth && "bg-muted/20",
              )}
            >
              <span
                className={cn(
                  "flex size-6 items-center justify-center self-start rounded-full text-xs tabular-nums",
                  isToday && "bg-primary text-primary-foreground font-semibold",
                  !isToday && !inMonth && "text-muted-foreground/60",
                  !isToday && inMonth && "text-muted-foreground",
                )}
              >
                {day.getDate()}
              </span>
              <div className="flex flex-col gap-0.5">
                {dayEvents.slice(0, 3).map(({ e, start }) => (
                  <span
                    key={`${e.application_id}-${e.starts_at}`}
                    role="link"
                    tabIndex={0}
                    onClick={(ev) => {
                      ev.stopPropagation();
                      router.push(`/ats/applications/${e.application_id}`);
                    }}
                    onKeyDown={(ev) => {
                      if (ev.key === "Enter") {
                        ev.stopPropagation();
                        router.push(`/ats/applications/${e.application_id}`);
                      }
                    }}
                    className="flex items-center gap-1 truncate rounded bg-emerald-500/15 px-1 py-0.5 text-[11px] text-emerald-800 hover:bg-emerald-500/25 dark:text-emerald-200"
                  >
                    <span className="tabular-nums">
                      {start.toLocaleTimeString(undefined, {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="truncate">{e.applicant_name}</span>
                  </span>
                ))}
                {dayEvents.length > 3 ? (
                  <span className="text-muted-foreground px-1 text-[11px]">
                    +{dayEvents.length - 3} more
                  </span>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
