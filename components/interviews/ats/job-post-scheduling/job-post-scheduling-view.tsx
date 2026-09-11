"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarClock, Link2, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/states";
import { toast } from "@/lib/utils/toast";
import {
  listInterviewStaff,
  setJobPostAvailability,
} from "@/features/interviews/interviewsService";
import { useJobPostAvailability } from "@/features/interviews/hooks";
import type {
  AvailabilityWindow,
  Interviewer,
  JobPostAvailability,
  LogisticsPresetInput,
} from "@/features/interviews/schema";
import { AvailabilityEditor } from "../shared/availability-editor";
import { LogisticsPresetsEditor } from "../shared/logistics-presets-editor";
import { WeekPreview } from "./week-preview";

export function JobPostSchedulingView({ jobId }: { jobId: string }) {
  const { data, loading, error, refetch } = useJobPostAvailability(jobId);

  if (error)
    return (
      <ErrorState message="Couldn't load scheduling." onRetry={refetch} />
    );
  if (loading || !data)
    return <Skeleton className="h-96 w-full" />;

  return (
    <SchedulingForm
      key={`${data.uses_custom_windows}-${data.uses_custom_logistics}-${data.interviewers.length}`}
      jobId={jobId}
      initial={data}
    />
  );
}

function SchedulingForm({
  jobId,
  initial,
}: {
  jobId: string;
  initial: JobPostAvailability;
}) {
  const [mode, setMode] = useState<"global" | "custom">(
    initial.uses_custom_windows ? "custom" : "global",
  );
  const [windows, setWindows] = useState<AvailabilityWindow[]>(initial.windows);
  const [logisticsMode, setLogisticsMode] = useState<"global" | "custom">(
    initial.uses_custom_logistics ? "custom" : "global",
  );
  const [presets, setPresets] = useState<LogisticsPresetInput[]>(
    initial.logistics_presets.map((p) => ({
      mode: p.mode,
      label: p.label,
      value: p.value,
      company_address_id: p.company_address_id,
    })),
  );
  const [interviewerIds, setInterviewerIds] = useState<string[]>(
    initial.interviewers.map((i) => i.id),
  );
  const [staff, setStaff] = useState<Interviewer[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    void listInterviewStaff()
      .then((r) => active && setStaff(r))
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const knownStaff = staff.length ? staff : initial.interviewers;

  const save = async () => {
    const payloadWindows = mode === "custom" ? windows : [];
    if (mode === "custom") {
      if (payloadWindows.length === 0) {
        toast.error("Add at least one window, or switch to the global calendar");
        return;
      }
      for (const w of payloadWindows) {
        if (w.end <= w.start) {
          toast.error("Every window must end after it starts");
          return;
        }
      }
    }
    const payloadPresets = logisticsMode === "custom" ? presets : [];
    if (logisticsMode === "custom") {
      for (const p of payloadPresets) {
        if (!p.label.trim() || (!p.company_address_id && !p.value.trim())) {
          toast.error("Every preset needs a name and a value or a linked address");
          return;
        }
      }
    }
    setSaving(true);
    try {
      await setJobPostAvailability(jobId, {
        windows: payloadWindows,
        interviewer_ids: interviewerIds,
        logistics_presets: payloadPresets,
      });
      toast.success("Scheduling saved");
    } catch {
      /* handled */
    } finally {
      setSaving(false);
    }
  };

  const toggle = (id: string) =>
    setInterviewerIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="size-4" /> Interview availability
          </CardTitle>
          <p className="text-muted-foreground text-xs">
            When candidates for this job post are in the interview stage, they
            book from these windows. Booking rules (slot length, notice, timezone)
            come from the{" "}
            <Link href="/ats/calendar/config" className="underline">
              global calendar
            </Link>
            .
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={mode}
            onValueChange={(v) => setMode(v as "global" | "custom")}
            className="gap-2"
          >
            <Label className="flex items-center gap-2 font-normal">
              <RadioGroupItem value="global" /> Use the global calendar
            </Label>
            <Label className="flex items-center gap-2 font-normal">
              <RadioGroupItem value="custom" /> Custom windows for this job post
            </Label>
          </RadioGroup>

          {mode === "custom" ? (
            <div className="space-y-4">
              <AvailabilityEditor windows={windows} onChange={setWindows} />
              {windows.length > 0 ? (
                <div className="rounded-lg border p-3">
                  <WeekPreview windows={windows} />
                </div>
              ) : null}
            </div>
          ) : (
            <p className="text-muted-foreground rounded-md border border-dashed p-3 text-sm">
              Candidates will see the global weekly windows.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="size-4" /> Logistics presets
          </CardTitle>
          <p className="text-muted-foreground text-xs">
            Named links and addresses to pick from when scheduling this
            post&apos;s interviews. Overriding only one mode (video or
            on-site) still falls back to the global list for the other.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={logisticsMode}
            onValueChange={(v) => setLogisticsMode(v as "global" | "custom")}
            className="gap-2"
          >
            <Label className="flex items-center gap-2 font-normal">
              <RadioGroupItem value="global" /> Use the global presets
            </Label>
            <Label className="flex items-center gap-2 font-normal">
              <RadioGroupItem value="custom" /> Custom presets for this job post
            </Label>
          </RadioGroup>

          {logisticsMode === "custom" ? (
            <LogisticsPresetsEditor presets={presets} onChange={setPresets} />
          ) : (
            <p className="text-muted-foreground rounded-md border border-dashed p-3 text-sm">
              HR will pick from the global logistics presets.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="size-4" /> Interviewers
          </CardTitle>
          <p className="text-muted-foreground text-xs">
            Shown to HR and the candidate. Does not affect which times are
            offered.
          </p>
        </CardHeader>
        <CardContent>
          {knownStaff.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No staff accounts available to assign.
            </p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {knownStaff.map((u) => (
                <Label
                  key={u.id}
                  className="flex items-center gap-2 font-normal"
                >
                  <Checkbox
                    checked={interviewerIds.includes(u.id)}
                    onCheckedChange={() => toggle(u.id)}
                  />
                  {u.first_name} {u.last_name}
                  <span className="text-muted-foreground text-xs">
                    {u.email}
                  </span>
                </Label>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save scheduling"}
        </Button>
      </div>
    </div>
  );
}
