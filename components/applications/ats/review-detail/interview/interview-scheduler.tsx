"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarClock, Check, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AddressMap } from "@/components/address-map";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { formatDateTime } from "@/lib/utils/format";
import { toast } from "@/lib/utils/toast";
import {
  deleteInterview,
  setInterview,
} from "@/features/applications/applicationsService";
import { useInterview } from "@/features/applications/hooks";
import type {
  InterviewMode,
  InterviewRequest,
} from "@/features/applications/schema";
import { useJobPostAvailability } from "@/features/interviews/hooks";

const MODE_OPTIONS: { value: InterviewMode; label: string; hint: string }[] = [
  { value: "video", label: "Video call", hint: "Meeting link" },
  { value: "onsite", label: "On-site", hint: "Office address" },
  { value: "phone", label: "Phone", hint: "Number to call" },
];
const DURATIONS = [15, 30, 45, 60, 90, 120];

/** Combine a Date (day) and an "HH:MM" string into an ISO instant. */
function toIso(day: Date, time: string): string | null {
  const [h, m] = time.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  const d = new Date(day);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

export function InterviewScheduler({
  applicationId,
  jobPostId,
}: {
  applicationId: string;
  jobPostId: string;
}) {
  const { interview, loading, error, setInterview: setLocal } =
    useInterview(applicationId);

  if (loading) return <Skeleton className="h-64 w-full" />;
  if (error) return null;

  return (
    <SchedulerForm
      key={interview?.id ?? "new"}
      applicationId={applicationId}
      jobPostId={jobPostId}
      initial={interview}
      onSaved={setLocal}
    />
  );
}

function SchedulerForm({
  applicationId,
  jobPostId,
  initial,
  onSaved,
}: {
  applicationId: string;
  jobPostId: string;
  initial: InterviewRequest | null;
  onSaved: (next: InterviewRequest | null) => void;
}) {
  const [mode, setMode] = useState<InterviewMode>(initial?.mode ?? "video");
  const [booking, setBooking] = useState<"calendar" | "manual">(
    initial && !initial.self_scheduled ? "manual" : "calendar",
  );
  const [details, setDetails] = useState(initial?.location_or_link ?? "");
  const [companyAddressId, setCompanyAddressId] = useState<string | null>(
    initial?.company_address_id ?? null,
  );
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [duration, setDuration] = useState(initial?.duration_minutes ?? 45);
  const [times, setTimes] = useState<string[]>(
    () => initial?.slots.map((s) => s.starts_at).sort() ?? [],
  );
  const [day, setDay] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState("09:00");
  const [saving, setSaving] = useState(false);
  const { data: availability } = useJobPostAvailability(jobPostId);

  const selectedIso = useMemo(
    () => initial?.slots.find((s) => s.selected)?.starts_at ?? null,
    [initial],
  );
  const modeHint = MODE_OPTIONS.find((m) => m.value === mode)?.hint ?? "";
  const modePresets = useMemo(
    () =>
      mode === "phone"
        ? []
        : (availability?.logistics_presets.filter((p) => p.mode === mode) ?? []),
    [availability, mode],
  );
  const linkedAddress =
    mode === "onsite" && companyAddressId
      ? (modePresets.find((p) => p.company_address_id === companyAddressId)?.address ??
        (companyAddressId === initial?.company_address_id ? initial?.address : null))
      : null;

  const addTime = () => {
    if (!day) {
      toast.error("Pick a day first");
      return;
    }
    const iso = toIso(day, time);
    if (!iso) return;
    if (new Date(iso).getTime() < Date.now()) {
      toast.error("That time is in the past");
      return;
    }
    setTimes((prev) =>
      prev.includes(iso) ? prev : [...prev, iso].sort((a, b) => a.localeCompare(b)),
    );
  };

  const removeTime = (iso: string) =>
    setTimes((prev) => prev.filter((t) => t !== iso));

  const save = async () => {
    if (booking === "manual" && times.length === 0) {
      toast.error("Add at least one time slot");
      return;
    }
    setSaving(true);
    try {
      const next = await setInterview(applicationId, {
        mode,
        location_or_link: details.trim() || null,
        company_address_id: mode === "onsite" ? companyAddressId : null,
        duration_minutes: duration,
        notes: notes.trim() || null,
        slots:
          booking === "manual"
            ? times.map((starts_at) => ({ starts_at }))
            : [],
      });
      onSaved(next);
      toast.success(initial ? "Interview updated" : "Interview scheduling sent");
    } catch {
      /* handled by api client */
    } finally {
      setSaving(false);
    }
  };

  const clear = async () => {
    try {
      await deleteInterview(applicationId);
      onSaved(null);
      toast.success("Interview scheduling cleared");
    } catch {
      /* handled */
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="flex items-center gap-2">
          <CalendarClock className="size-4" /> Interview scheduling
        </CardTitle>
        {initial ? (
          <ConfirmDialog
            trigger={
              <Button variant="ghost" size="sm">
                Clear
              </Button>
            }
            title="Clear interview scheduling?"
            description="The proposed times and any confirmation the candidate made will be removed."
            destructive
            confirmLabel="Clear"
            onConfirm={clear}
          />
        ) : null}
      </CardHeader>
      <CardContent className="space-y-5">
        {selectedIso ? (
          <div className="flex items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm">
            <Check className="size-4 text-emerald-600" />
            <span>
              Candidate confirmed{" "}
              <span className="font-medium">{formatDateTime(selectedIso)}</span>
            </span>
          </div>
        ) : initial ? (
          <p className="text-muted-foreground text-sm">
            Waiting for the candidate to pick a time.
          </p>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label>Mode</Label>
            <Select
              value={mode}
              onValueChange={(v) => {
                setMode(v as InterviewMode);
                setCompanyAddressId(null);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MODE_OPTIONS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>{modeHint}</Label>
            <div className="flex gap-2">
              <Input
                value={details}
                onChange={(e) => {
                  setDetails(e.target.value);
                  setCompanyAddressId(null);
                }}
                placeholder={
                  mode === "video"
                    ? "https://meet.example.com/…"
                    : mode === "onsite"
                      ? "5F, Tower One, BGC, Taguig"
                      : "+63 …"
                }
              />
              {modePresets.length > 0 ? (
                <Select
                  value=""
                  onValueChange={(v) => {
                    const preset = modePresets.find((p) => p.id === v);
                    if (!preset) return;
                    setDetails(preset.value);
                    setCompanyAddressId(preset.company_address_id);
                  }}
                >
                  <SelectTrigger className="w-40 shrink-0" size="default">
                    <SelectValue placeholder="Use a preset" />
                  </SelectTrigger>
                  <SelectContent>
                    {modePresets.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : null}
            </div>
            {linkedAddress ? (
              <AddressMap
                latitude={linkedAddress.latitude}
                longitude={linkedAddress.longitude}
                label={linkedAddress.label}
                className="h-32 w-full rounded-md border"
              />
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label>Duration</Label>
            <Select
              value={String(duration)}
              onValueChange={(v) => setDuration(Number(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DURATIONS.map((d) => (
                  <SelectItem key={d} value={String(d)}>
                    {d} min
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="interview-notes">Notes for the candidate</Label>
          <Textarea
            id="interview-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Anything they should know or bring. Shown to the candidate."
          />
        </div>

        <div className="space-y-2">
          <Label>How the candidate books</Label>
          <RadioGroup
            value={booking}
            onValueChange={(v) => setBooking(v as "calendar" | "manual")}
            className="gap-2"
          >
            <Label className="flex flex-wrap items-center gap-1.5 text-sm font-normal">
              <RadioGroupItem value="calendar" /> Any open time from the{" "}
              <Link href="/ats/calendar/config" className="underline">
                interview calendar
              </Link>
            </Label>
            <Label className="flex items-center gap-2 text-sm font-normal">
              <RadioGroupItem value="manual" /> Specific times I choose
            </Label>
          </RadioGroup>
        </div>

        {booking === "manual" ? (
        <div className="space-y-2">
          <Label>Propose times</Label>
          <div className="flex flex-wrap items-start gap-4">
            <Calendar
              mode="single"
              selected={day}
              onSelect={setDay}
              disabled={{ before: new Date() }}
              className="rounded-md border p-2"
            />
            <div className="flex items-end gap-2">
              <div className="space-y-1.5">
                <Label htmlFor="interview-time">Time</Label>
                <Input
                  id="interview-time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-32"
                />
              </div>
              <Button type="button" variant="outline" onClick={addTime}>
                <Plus /> Add
              </Button>
            </div>
          </div>

          {times.length > 0 ? (
            <ul className="flex flex-wrap gap-2 pt-1">
              {times.map((iso) => (
                <li
                  key={iso}
                  className="bg-muted flex items-center gap-1.5 rounded-full py-1 pr-1 pl-3 text-xs"
                >
                  {formatDateTime(iso)}
                  <button
                    type="button"
                    onClick={() => removeTime(iso)}
                    className="hover:bg-background rounded-full p-0.5"
                    aria-label={`Remove ${formatDateTime(iso)}`}
                  >
                    <X className="size-3" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-xs">
              No times proposed yet.
            </p>
          )}
        </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            The candidate picks any open time from your interview calendar
            (or this job post&apos;s own windows). Booked times are then blocked
            for everyone.
          </p>
        )}

        <div className="flex justify-end">
          <Button
            onClick={save}
            disabled={saving || (booking === "manual" && times.length === 0)}
          >
            {saving ? "Saving…" : initial ? "Update" : "Send to candidate"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
