"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarX2, ChevronDown, ChevronRight, Clock, Globe } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ErrorState } from "@/components/states";
import { toast } from "@/lib/utils/toast";
import { setGlobalAvailability } from "@/features/interviews/interviewsService";
import { useGlobalAvailability } from "@/features/interviews/hooks";
import {
  TIMEZONE_OPTIONS,
  type AvailabilityWindow,
  type GlobalAvailability,
  type InterviewConfig,
} from "@/features/interviews/schema";
import { AvailabilityEditor } from "./availability-editor";

export function AvailabilityView() {
  const { data, loading, error, refetch } = useGlobalAvailability();

  if (error)
    return (
      <ErrorState
        message="Couldn't load the interview calendar."
        onRetry={refetch}
      />
    );
  if (loading || !data)
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-[28rem] w-full" />
      </div>
    );

  return (
    <div className="mx-auto max-w-3xl">
      <CalendarForm
        key={data.config.timezone + data.windows.length}
        initial={data}
      />
    </div>
  );
}

const snapshot = (
  config: InterviewConfig,
  windows: AvailabilityWindow[],
) => JSON.stringify({ config, windows });

function CalendarForm({ initial }: { initial: GlobalAvailability }) {
  const [windows, setWindows] = useState<AvailabilityWindow[]>(initial.windows);
  const [config, setConfig] = useState<InterviewConfig>(initial.config);
  const [saving, setSaving] = useState(false);
  const [savedSnapshot, setSavedSnapshot] = useState(() =>
    snapshot(initial.config, initial.windows),
  );
  const dirty = snapshot(config, windows) !== savedSnapshot;
  const overrideCount = initial.overrides.length;

  const save = async () => {
    for (const w of windows) {
      if (w.end <= w.start) {
        toast.error("Every time range must end after it starts");
        return;
      }
    }
    setSaving(true);
    try {
      const next = await setGlobalAvailability({ config, windows });
      setWindows(next.windows);
      setConfig(next.config);
      setSavedSnapshot(snapshot(next.config, next.windows));
      toast.success("Availability saved");
    } catch {
      /* handled */
    } finally {
      setSaving(false);
    }
  };

  const tz = config.timezone.replace(/_/g, " ");

  return (
    <div className="space-y-5">
      {/* header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Availability</h1>
          <p className="text-muted-foreground text-sm">
            The hours candidates can book interviews in. A job post can set its
            own on its Scheduling tab.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {dirty ? (
            <span className="text-muted-foreground text-xs">Unsaved</span>
          ) : null}
          <Button onClick={save} disabled={saving || !dirty}>
            {saving ? "Saving…" : dirty ? "Save" : "Saved"}
          </Button>
        </div>
      </div>

      {/* weekly hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="size-4" /> Weekly hours
          </CardTitle>
          <p className="text-muted-foreground inline-flex items-center gap-1.5 text-xs">
            <Globe className="size-3.5" /> Times are in {tz}
          </p>
        </CardHeader>
        <CardContent>
          <AvailabilityEditor
            windows={windows}
            onChange={setWindows}
            disabled={saving}
          />
        </CardContent>
      </Card>

      {/* date overrides — own page (a year's worth would clog this one) */}
      <Link
        href="/ats/calendar/overrides"
        className="hover:bg-accent/50 flex items-center gap-3 rounded-xl border bg-card px-6 py-4 transition-colors"
      >
        <CalendarX2 className="text-muted-foreground size-5 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium">Date overrides</p>
          <p className="text-muted-foreground text-xs">
            {overrideCount === 0
              ? "Block a holiday, or use different hours on specific dates. Bulk-import from CSV."
              : `${overrideCount} override${overrideCount === 1 ? "" : "s"} set — holidays and one-off changes to the weekly hours.`}
          </p>
        </div>
        <ChevronRight className="text-muted-foreground size-4 shrink-0" />
      </Link>

      {/* booking rules — tucked away; rarely changed */}
      <details className="group rounded-xl border bg-card">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-6 py-4 text-sm font-medium [&::-webkit-details-marker]:hidden">
          <span>
            Booking rules
            <span className="text-muted-foreground ml-2 font-normal">
              {config.slot_minutes}-min slots · up to {config.horizon_days}d
              ahead · {config.min_notice_hours}h notice · {tz}
            </span>
          </span>
          <ChevronDown className="size-4 shrink-0 transition-transform group-open:rotate-180" />
        </summary>
        <div className="grid gap-4 px-6 pt-1 pb-6 sm:grid-cols-2">
          <Field label="Slot length" hint="How long each interview slot is.">
            <Select
              value={String(config.slot_minutes)}
              onValueChange={(v) =>
                setConfig({ ...config, slot_minutes: Number(v) })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[15, 30, 45, 60, 90, 120].map((m) => (
                  <SelectItem key={m} value={String(m)}>
                    {m} min
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field
            label="How far ahead"
            hint="Days into the future a candidate can pick from."
          >
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                max={120}
                value={config.horizon_days}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  setConfig({
                    ...config,
                    horizon_days:
                      Number.isFinite(n) && n > 0 ? n : config.horizon_days,
                  });
                }}
              />
              <span className="text-muted-foreground text-sm">days</span>
            </div>
          </Field>
          <Field
            label="Shortest notice"
            hint="A candidate can't book a time sooner than this."
          >
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                max={336}
                value={config.min_notice_hours}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  setConfig({
                    ...config,
                    min_notice_hours: Number.isFinite(n) && n >= 0 ? n : 0,
                  });
                }}
              />
              <span className="text-muted-foreground text-sm">hours</span>
            </div>
          </Field>
          <Field label="Timezone" hint="What the hours above are measured in.">
            <Select
              value={config.timezone}
              onValueChange={(v) => setConfig({ ...config, timezone: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[...new Set([config.timezone, ...TIMEZONE_OPTIONS])].map((z) => (
                  <SelectItem key={z} value={z}>
                    {z.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
      </details>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
      {hint ? (
        <p className="text-muted-foreground text-[11px]">{hint}</p>
      ) : null}
    </div>
  );
}
