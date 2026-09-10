"use client";

import { useRef } from "react";
import { Copy, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/cn";
import { toast } from "@/lib/utils/toast";
import { WEEKDAY_LABELS, type AvailabilityWindow } from "@/features/interviews/schema";

const DEFAULT_RANGE = { start: "09:00", end: "17:00" };

/** Calendly-style weekly hours editor. Controlled. */
export function AvailabilityEditor({
  windows,
  onChange,
  disabled,
}: {
  windows: AvailabilityWindow[];
  onChange: (next: AvailabilityWindow[]) => void;
  disabled?: boolean;
}) {
  // Remembers a day's ranges across an off→on toggle within the session.
  const stash = useRef<Record<number, AvailabilityWindow[]>>({});

  const forDay = (weekday: number) =>
    windows
      .map((w, i) => ({ w, i }))
      .filter((r) => r.w.weekday === weekday);

  const setDay = (weekday: number, rows: AvailabilityWindow[]) =>
    onChange([...windows.filter((w) => w.weekday !== weekday), ...rows]);

  const toggleDay = (weekday: number, on: boolean) => {
    if (on) {
      const restored = stash.current[weekday]?.length
        ? stash.current[weekday]
        : [{ weekday, ...DEFAULT_RANGE }];
      setDay(weekday, restored);
    } else {
      stash.current[weekday] = forDay(weekday).map((r) => r.w);
      setDay(weekday, []);
    }
  };

  const update = (index: number, patch: Partial<AvailabilityWindow>) =>
    onChange(windows.map((w, i) => (i === index ? { ...w, ...patch } : w)));

  const removeRange = (index: number) =>
    onChange(windows.filter((_, i) => i !== index));

  const addRange = (weekday: number) => {
    const last = forDay(weekday).at(-1)?.w;
    onChange([
      ...windows,
      { weekday, start: last?.end ?? "09:00", end: "17:00" },
    ]);
  };

  const copyToAll = (weekday: number) => {
    const src = forDay(weekday).map((r) => ({ start: r.w.start, end: r.w.end }));
    if (src.length === 0) return;
    onChange(
      WEEKDAY_LABELS.flatMap((_, day) =>
        src.map((r) => ({ weekday: day, ...r })),
      ),
    );
    toast.success("Applied to every day");
  };

  return (
    <div className="divide-y">
      {WEEKDAY_LABELS.map((label, weekday) => {
        const rows = forDay(weekday);
        const on = rows.length > 0;
        return (
          <div
            key={label}
            className="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-start"
          >
            <label className="flex w-32 shrink-0 items-center gap-3 pt-1.5 select-none">
              <Switch
                checked={on}
                disabled={disabled}
                onCheckedChange={(v) => toggleDay(weekday, v)}
              />
              <span
                className={cn(
                  "text-sm font-medium",
                  !on && "text-muted-foreground",
                )}
              >
                {label}
              </span>
            </label>

            <div className="flex flex-1 flex-col gap-2">
              {!on ? (
                <span className="text-muted-foreground pt-1.5 text-sm">
                  Unavailable
                </span>
              ) : (
                rows.map(({ w, i }, ri) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={w.start}
                      disabled={disabled}
                      onChange={(e) => update(i, { start: e.target.value })}
                      className="h-9 w-[7.5rem]"
                    />
                    <span className="text-muted-foreground text-sm">–</span>
                    <Input
                      type="time"
                      value={w.end}
                      disabled={disabled}
                      onChange={(e) => update(i, { end: e.target.value })}
                      className="h-9 w-[7.5rem]"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-9 shrink-0"
                      disabled={disabled}
                      onClick={() => removeRange(i)}
                      aria-label="Remove time range"
                    >
                      <X className="size-4" />
                    </Button>
                    {ri === 0 ? (
                      <>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-9 shrink-0"
                          disabled={disabled}
                          onClick={() => addRange(weekday)}
                          aria-label="Add another time range"
                        >
                          <Plus className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground size-9 shrink-0"
                          disabled={disabled}
                          onClick={() => copyToAll(weekday)}
                          title="Copy these hours to every day"
                          aria-label="Copy these hours to every day"
                        >
                          <Copy className="size-4" />
                        </Button>
                      </>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
