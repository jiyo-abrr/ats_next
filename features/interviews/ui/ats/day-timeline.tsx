"use client";

import { useRouter } from "next/navigation";

import { cn } from "@/lib/cn";
import { zonedWallTime } from "@/features/interviews/tz";
import type {
  AvailabilityWindow,
  UpcomingInterview,
} from "@/features/interviews/schema";

const HOUR_PX = 48;
const MODE_DOT: Record<string, string> = {
  video: "bg-blue-500",
  onsite: "bg-emerald-500",
  phone: "bg-amber-500",
};

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const minutesInto = (d: Date) => d.getHours() * 60 + d.getMinutes();

function hourLabel(h: number) {
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}${h < 12 || h === 24 ? "am" : "pm"}`;
}

/** Day / week time-grid. `days` is 1 date (day view) or 7 (week view). Events
 * never overlap (the backend blocks it), so each fills its column width. */
export function DayTimeline({
  days,
  events,
  availability = [],
  timezone,
}: {
  days: Date[];
  events: UpcomingInterview[];
  /** Recurring bookable windows, shaded behind the events. */
  availability?: AvailabilityWindow[];
  /** IANA zone the availability windows are written in. */
  timezone?: string;
}) {
  const router = useRouter();
  const now = new Date();
  const tz =
    timezone ??
    Intl.DateTimeFormat().resolvedOptions().timeZone ??
    "UTC";

  const byDay = days.map((day) =>
    events
      .map((e) => ({ e, start: new Date(e.starts_at), end: new Date(e.ends_at) }))
      .filter((x) => sameDay(x.start, day))
      .sort((a, b) => a.start.getTime() - b.start.getTime()),
  );

  // Availability bands, resolved to this viewer's local minutes per day column.
  const bandsByDay = days.map((day) => {
    const weekday = (day.getDay() + 6) % 7; // Mon = 0
    return availability
      .filter((w) => w.weekday === weekday)
      .map((w) => {
        const s = zonedWallTime(
          day.getFullYear(),
          day.getMonth(),
          day.getDate(),
          w.start,
          tz,
        );
        const e = zonedWallTime(
          day.getFullYear(),
          day.getMonth(),
          day.getDate(),
          w.end,
          tz,
        );
        return { startMin: minutesInto(s), endMin: minutesInto(e) };
      })
      .filter((b) => b.endMin > b.startMin);
  });

  const allStarts = [
    ...byDay.flat().map((x) => x.start.getHours()),
    ...bandsByDay.flat().map((b) => Math.floor(b.startMin / 60)),
  ];
  const allEnds = [
    ...byDay.flat().map((x) => Math.ceil(minutesInto(x.end) / 60)),
    ...bandsByDay.flat().map((b) => Math.ceil(b.endMin / 60)),
  ];
  const startHour = Math.max(0, Math.min(8, ...allStarts));
  const endHour = Math.min(24, Math.max(18, ...allEnds));
  const span = (endHour - startHour) * 60;
  const height = (endHour - startHour) * HOUR_PX;
  const hours = Array.from(
    { length: endHour - startHour + 1 },
    (_, i) => startHour + i,
  );
  const pct = (min: number) => ((min - startHour * 60) / span) * 100;

  return (
    <div className="overflow-x-auto">
      <div className={cn(days.length > 1 && "min-w-[720px]")}>
        {/* column headers */}
        <div
          className="grid border-b"
          style={{
            gridTemplateColumns: `3.5rem repeat(${days.length}, 1fr)`,
          }}
        >
          <div />
          {days.map((d) => {
            const isToday = sameDay(d, now);
            return (
              <div key={d.toISOString()} className="px-2 pb-2 text-center">
                <div className="text-muted-foreground text-[11px] uppercase">
                  {d.toLocaleDateString(undefined, { weekday: "short" })}
                </div>
                <div
                  className={cn(
                    "mx-auto mt-0.5 flex size-7 items-center justify-center rounded-full text-sm font-medium tabular-nums",
                    isToday && "bg-primary text-primary-foreground",
                  )}
                >
                  {d.getDate()}
                </div>
              </div>
            );
          })}
        </div>

        {/* grid body */}
        <div
          className="grid"
          style={{
            gridTemplateColumns: `3.5rem repeat(${days.length}, 1fr)`,
            height,
          }}
        >
          <div className="relative">
            {hours.map((h, i) => (
              <span
                key={h}
                className="text-muted-foreground absolute right-1.5 -translate-y-1/2 text-[10px] tabular-nums"
                style={{ top: (i / (hours.length - 1)) * 100 + "%" }}
              >
                {i === 0 ? "" : hourLabel(h)}
              </span>
            ))}
          </div>

          {days.map((day, di) => {
            const isToday = sameDay(day, now);
            return (
              <div key={day.toISOString()} className="relative border-l">
                {/* bookable-hours shading */}
                {bandsByDay[di].map((b, bi) => (
                  <div
                    key={bi}
                    aria-hidden
                    className="absolute inset-x-0 bg-emerald-500/[0.07]"
                    style={{
                      top: `${pct(b.startMin)}%`,
                      height: `${pct(b.endMin) - pct(b.startMin)}%`,
                    }}
                  />
                ))}

                {hours.slice(1).map((h, i) => (
                  <span
                    key={h}
                    aria-hidden
                    className="border-border/50 absolute inset-x-0 border-t"
                    style={{ top: ((i + 1) / (hours.length - 1)) * 100 + "%" }}
                  />
                ))}

                {isToday &&
                minutesInto(now) >= startHour * 60 &&
                minutesInto(now) <= endHour * 60 ? (
                  <span
                    aria-hidden
                    className="absolute inset-x-0 z-10 border-t-2 border-red-500"
                    style={{ top: `${pct(minutesInto(now))}%` }}
                  >
                    <span className="absolute -top-1 -left-1 size-2 rounded-full bg-red-500" />
                  </span>
                ) : null}

                {byDay[di].map(({ e, start, end }) => (
                  <button
                    key={`${e.application_id}-${e.starts_at}`}
                    type="button"
                    onClick={() =>
                      router.push(`/ats/applications/${e.application_id}`)
                    }
                    className="absolute inset-x-1 overflow-hidden rounded-md border border-emerald-500/40 bg-emerald-500/15 px-2 py-1 text-left text-[11px] leading-tight text-emerald-800 transition-colors hover:bg-emerald-500/25 dark:text-emerald-200"
                    style={{
                      top: `${pct(minutesInto(start))}%`,
                      height: `${Math.max(
                        pct(minutesInto(end)) - pct(minutesInto(start)),
                        6,
                      )}%`,
                    }}
                  >
                    <span className="flex items-center gap-1 font-medium">
                      <span
                        className={cn(
                          "size-1.5 shrink-0 rounded-full",
                          MODE_DOT[e.mode] ?? "bg-muted-foreground",
                        )}
                      />
                      {start.toLocaleTimeString(undefined, {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="block truncate">{e.applicant_name}</span>
                    <span className="text-muted-foreground block truncate">
                      {e.job_title}
                    </span>
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
