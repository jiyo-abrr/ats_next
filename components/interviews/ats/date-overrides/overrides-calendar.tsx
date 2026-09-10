"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/cn";
import { toast } from "@/lib/utils/toast";
import type { DateOverride } from "@/features/interviews/schema";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DEFAULT_HOURS = { start: "09:00", end: "17:00" };

function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}
function parseYmd(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function fmtDay(s: string) {
  return parseYmd(s).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
function rangeLabel(o: { start_date: string; end_date: string }) {
  return o.start_date === o.end_date
    ? fmtDay(o.start_date)
    : `${fmtDay(o.start_date)} – ${fmtDay(o.end_date)}`;
}
const sameMonth = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
const isToday = (d: Date) => ymd(d) === ymd(new Date());

type Draft = {
  mode: "blocked" | "hours" | "none";
  endDate: string;
  start: string;
  end: string;
  note: string;
};

export function OverridesCalendar({
  rows,
  onChange,
  disabled,
}: {
  rows: DateOverride[];
  onChange: (next: DateOverride[]) => void;
  disabled?: boolean;
}) {
  const today = ymd(new Date());
  const sorted = useMemo(
    () => [...rows].sort((a, b) => a.start_date.localeCompare(b.start_date)),
    [rows],
  );

  const [cursor, setCursor] = useState<Date>(() => {
    const next = sorted.find((o) => o.end_date >= today);
    return next ? parseYmd(next.start_date) : new Date();
  });
  const [selected, setSelected] = useState<string | null>(null);
  const [hoverDay, setHoverDay] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>({
    mode: "blocked",
    endDate: "",
    start: DEFAULT_HOURS.start,
    end: DEFAULT_HOURS.end,
    note: "",
  });

  const covering = (day: string) =>
    rows.filter((o) => day >= o.start_date && day <= o.end_date);
  /** blocked wins over custom-hours, matching the backend. */
  const primary = (day: string) => {
    const c = covering(day);
    return c.find((o) => o.is_unavailable) ?? c[0] ?? null;
  };
  const anchored = (day: string) =>
    rows.find((o) => o.start_date === day) ?? null;

  /** True while the right-hand editor is open for a brand-new override (so a
   * second click on the grid means "set the range end", not "switch days"). */
  const pickingRange = selected !== null && anchored(selected) === null;

  const openDay = (day: string) => {
    if (disabled) return;
    const existing = anchored(day);

    if (pickingRange && !existing && day !== selected) {
      if (day > selected!) {
        setDraft((d) => ({ ...d, endDate: day })); // second click = range end
        return;
      }
      setSelected(day); // clicked earlier — restart the range here
      setDraft((d) => ({ ...d, endDate: "" }));
      return;
    }

    setSelected(day);
    setDraft(
      existing
        ? {
            mode: existing.is_unavailable ? "blocked" : "hours",
            endDate: existing.end_date === day ? "" : existing.end_date,
            start: existing.start ?? DEFAULT_HOURS.start,
            end: existing.end ?? DEFAULT_HOURS.end,
            note: existing.note ?? "",
          }
        : {
            mode: "blocked",
            endDate: "",
            start: DEFAULT_HOURS.start,
            end: DEFAULT_HOURS.end,
            note: "",
          },
    );
  };

  const close = () => {
    setSelected(null);
    setHoverDay(null);
  };

  /** "Add" from the list — start a fresh override on the first day of the
   * month in view (but never in the past). */
  const addNew = () => {
    const first = ymd(new Date(cursor.getFullYear(), cursor.getMonth(), 1));
    const start = first < today ? today : first;
    setCursor(parseYmd(start));
    openDay(start);
  };

  /** The tentative range end while picking: a committed end date, else the
   * hovered day. */
  const rangeEnd =
    pickingRange && selected
      ? draft.endDate || (hoverDay && hoverDay > selected ? hoverDay : "")
      : "";
  const inPickRange = (key: string) =>
    !!rangeEnd && !!selected && key > selected && key <= rangeEnd;

  const removeAnchored = (day: string) => {
    onChange(rows.filter((o) => o.start_date !== day));
  };

  const apply = () => {
    if (!selected) return;
    const endDate = draft.endDate || selected;
    if (endDate < selected) {
      toast.error("The end date is before the start date.");
      return;
    }
    if (draft.mode === "hours" && draft.end <= draft.start) {
      toast.error("End time must be after start time.");
      return;
    }
    const rest = rows.filter((o) => o.start_date !== selected);
    if (draft.mode === "none") {
      onChange(rest);
      close();
      return;
    }
    const existing = anchored(selected);
    onChange([
      ...rest,
      {
        id: existing?.id ?? crypto.randomUUID(),
        start_date: selected,
        end_date: endDate,
        is_unavailable: draft.mode === "blocked",
        start: draft.mode === "hours" ? draft.start : null,
        end: draft.mode === "hours" ? draft.end : null,
        note: draft.note.trim() || null,
      },
    ]);
    close();
  };

  // month grid — Monday-first 6×7
  const cells = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const start = new Date(first);
    start.setDate(first.getDate() - ((first.getDay() + 6) % 7));
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [cursor]);

  const monthTitle = cursor.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const stepMonth = (dir: 1 | -1) =>
    setCursor(
      (c) => new Date(c.getFullYear(), c.getMonth() + dir, 1),
    );

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
      {/* calendar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-lg font-medium">{monthTitle}</p>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCursor(new Date())}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => stepMonth(-1)}
              aria-label="Previous month"
            >
              <ChevronLeft />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => stepMonth(1)}
              aria-label="Next month"
            >
              <ChevronRight />
            </Button>
          </div>
        </div>

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
          <div
            className="grid grid-cols-7"
            onMouseLeave={() => setHoverDay(null)}
          >
            {cells.map((day, i) => {
              const key = ymd(day);
              const inMonth = sameMonth(day, cursor);
              const p = primary(key);
              const isAnchor = anchored(key) !== null;
              return (
                <button
                  key={i}
                  type="button"
                  disabled={disabled}
                  onClick={() => openDay(key)}
                  onMouseEnter={() =>
                    pickingRange ? setHoverDay(key) : undefined
                  }
                  className={cn(
                    "relative flex min-h-[5.5rem] flex-col gap-1 border-r border-b p-1.5 text-left transition-colors [&:nth-child(7n)]:border-r-0",
                    i >= 35 && "border-b-0",
                    !inMonth && "bg-muted/20",
                    !disabled && "hover:bg-muted/50",
                    p?.is_unavailable && "bg-rose-500/10",
                    p && !p.is_unavailable && "bg-amber-500/10",
                    inPickRange(key) && "bg-primary/10",
                    (selected === key || rangeEnd === key) &&
                      "ring-primary ring-2 ring-inset",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-6 items-center justify-center self-start rounded-full text-xs tabular-nums",
                      isToday(day) &&
                        "bg-primary text-primary-foreground font-semibold",
                      !isToday(day) && !inMonth && "text-muted-foreground/50",
                      !isToday(day) && inMonth && "text-muted-foreground",
                    )}
                  >
                    {day.getDate()}
                  </span>
                  {p ? (
                    <span
                      className={cn(
                        "truncate rounded px-1 py-0.5 text-[11px] font-medium",
                        p.is_unavailable
                          ? "bg-rose-500/15 text-rose-700 dark:text-rose-300"
                          : "bg-amber-500/15 text-amber-700 dark:text-amber-300",
                      )}
                    >
                      {p.is_unavailable
                        ? "Unavailable"
                        : `${p.start}–${p.end}`}
                    </span>
                  ) : null}
                  {isAnchor && anchored(key)?.note ? (
                    <span className="text-muted-foreground truncate text-[11px]">
                      {anchored(key)?.note}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        <div className="text-muted-foreground flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="size-3 rounded-sm bg-rose-500/20" /> Unavailable
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-3 rounded-sm bg-amber-500/20" /> Custom hours
          </span>
          <span>· click a day — then a later day for a range</span>
        </div>
      </div>

      {/* right column: day editor or the full list */}
      <div className="lg:border-l lg:pl-4">
        {selected ? (
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium">
                  {draft.endDate && draft.endDate > selected
                    ? `${fmtDay(selected)} → ${fmtDay(draft.endDate)}`
                    : fmtDay(selected)}
                </p>
                {pickingRange ? (
                  <p className="text-muted-foreground text-[11px]">
                    {draft.endDate
                      ? "Multi-day range set."
                      : "Click a later day to make it a range."}
                  </p>
                ) : null}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 shrink-0"
                onClick={close}
                aria-label="Close"
              >
                <X className="size-4" />
              </Button>
            </div>

            <div className="bg-muted inline-flex rounded-md p-[3px] text-xs">
              {(
                [
                  ["blocked", "Unavailable"],
                  ["hours", "Custom hours"],
                ] as const
              ).map(([val, text]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setDraft((d) => ({ ...d, mode: val }))}
                  className={cn(
                    "rounded-sm px-2.5 py-1 transition-colors",
                    draft.mode === val
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {text}
                </button>
              ))}
            </div>

            {draft.mode === "hours" ? (
              <div className="flex items-center gap-1.5">
                <Input
                  type="time"
                  value={draft.start}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, start: e.target.value }))
                  }
                  className="h-8"
                />
                <span className="text-muted-foreground">–</span>
                <Input
                  type="time"
                  value={draft.end}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, end: e.target.value }))
                  }
                  className="h-8"
                />
              </div>
            ) : null}

            <div className="space-y-1.5">
              <Label className="text-xs">End day (optional)</Label>
              <div className="flex items-center gap-1.5">
                <Input
                  type="date"
                  value={draft.endDate}
                  min={selected}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, endDate: e.target.value }))
                  }
                  className="h-8"
                />
                {draft.endDate ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0"
                    onClick={() => setDraft((d) => ({ ...d, endDate: "" }))}
                    aria-label="Clear end day"
                  >
                    <X className="size-4" />
                  </Button>
                ) : null}
              </div>
              <p className="text-muted-foreground text-[11px]">
                Click a later day on the calendar, or pick one here. Blank = just
                this day.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Note</Label>
              <Input
                value={draft.note}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, note: e.target.value }))
                }
                placeholder="Holiday, company event…"
                className="h-8"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Button size="sm" onClick={apply}>
                {anchored(selected) ? "Update" : "Add"}
              </Button>
              {anchored(selected) ? (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-muted-foreground"
                  onClick={() => {
                    removeAnchored(selected);
                    close();
                  }}
                >
                  <Trash2 className="size-3.5" /> Remove
                </Button>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                All overrides ({sorted.length})
              </p>
              <Button
                size="sm"
                variant="outline"
                className="h-7"
                disabled={disabled}
                onClick={addNew}
              >
                <Plus className="size-3.5" /> Add
              </Button>
            </div>
            {sorted.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                None yet. Hit Add, click a day on the calendar, or import a CSV.
              </p>
            ) : (
              <ul className="max-h-[26rem] space-y-1 overflow-y-auto pr-1">
                {sorted.map((o) => (
                  <li key={o.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setCursor(parseYmd(o.start_date));
                        openDay(o.start_date);
                      }}
                      className="hover:bg-muted/60 flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left text-sm"
                    >
                      <span
                        className={cn(
                          "mt-0.5 size-2 shrink-0 rounded-full",
                          o.is_unavailable ? "bg-rose-500" : "bg-amber-500",
                        )}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate">
                          {rangeLabel(o)}
                        </span>
                        <span className="text-muted-foreground block truncate text-xs">
                          {o.is_unavailable
                            ? "Unavailable"
                            : `${o.start}–${o.end}`}
                          {o.note ? ` · ${o.note}` : ""}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {sorted.length > 0 ? (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                disabled={disabled}
                onClick={() => onChange([])}
              >
                Clear all
              </Button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
