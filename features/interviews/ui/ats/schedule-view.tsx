"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/cn";
import {
  useGlobalAvailability,
  useSchedule,
} from "@/features/interviews/hooks";
import { DayTimeline } from "./day-timeline";
import { MonthGrid } from "./month-grid";

type View = "month" | "week" | "day";

const startOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};
const mondayOf = (d: Date) => {
  const x = startOfDay(d);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x;
};
const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

export function ScheduleView() {
  const [view, setView] = useState<View>("month");
  const [cursor, setCursor] = useState<Date>(() => new Date());

  const { from, to } = useMemo(() => {
    if (view === "day")
      return { from: startOfDay(cursor), to: addDays(startOfDay(cursor), 1) };
    if (view === "week")
      return { from: mondayOf(cursor), to: addDays(mondayOf(cursor), 7) };
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    return { from: mondayOf(first), to: addDays(mondayOf(first), 42) };
  }, [view, cursor]);

  const { data, loading } = useSchedule(from.toISOString(), to.toISOString());
  const { data: availability } = useGlobalAvailability();
  const showBands = view !== "month";

  const step = (dir: 1 | -1) => {
    if (view === "day") setCursor((c) => addDays(c, dir));
    else if (view === "week") setCursor((c) => addDays(c, 7 * dir));
    else
      setCursor((c) => {
        const x = new Date(c);
        x.setMonth(x.getMonth() + dir);
        return x;
      });
  };

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(mondayOf(cursor), i)),
    [cursor],
  );

  const title =
    view === "month"
      ? cursor.toLocaleDateString(undefined, {
          month: "long",
          year: "numeric",
        })
      : view === "week"
        ? `${mondayOf(cursor).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })} – ${addDays(mondayOf(cursor), 6).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}`
        : cursor.toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Schedule</h1>
          <p className="text-muted-foreground text-sm">
            Confirmed interviews, in your local timezone.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCursor(new Date())}
          >
            Today
          </Button>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => step(-1)}
              aria-label="Previous"
            >
              <ChevronLeft />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => step(1)}
              aria-label="Next"
            >
              <ChevronRight />
            </Button>
          </div>
          <div className="bg-muted inline-flex rounded-lg p-[3px]">
            {(["month", "week", "day"] as View[]).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={cn(
                  "rounded-md px-3 py-1 text-sm capitalize transition-colors",
                  v === view
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-lg font-medium">{title}</p>
        {showBands && availability && availability.windows.length > 0 ? (
          <div className="text-muted-foreground flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="size-3 rounded-sm bg-emerald-500/[0.12]" />
              Bookable ({availability.config.timezone.replace(/_/g, " ")})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-3 rounded-sm border border-emerald-500/40 bg-emerald-500/20" />
              Booked
            </span>
          </div>
        ) : null}
      </div>

      {loading && data.length === 0 ? (
        <Skeleton className="h-[34rem] w-full" />
      ) : view === "month" ? (
        <MonthGrid
          month={cursor}
          events={data}
          onDayClick={(d) => {
            setCursor(d);
            setView("day");
          }}
        />
      ) : view === "week" ? (
        <DayTimeline
          days={weekDays}
          events={data}
          availability={availability?.windows}
          timezone={availability?.config.timezone}
        />
      ) : (
        <DayTimeline
          days={[startOfDay(cursor)]}
          events={data}
          availability={availability?.windows}
          timezone={availability?.config.timezone}
        />
      )}
    </div>
  );
}
