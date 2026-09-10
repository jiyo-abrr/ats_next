"use client";

import { useEffect, useState } from "react";
import { Check, MapPin, Phone, Video } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/cn";
import { toast } from "@/lib/utils/toast";
import {
  getInterviewOpenSlots,
  selectInterviewSlot,
} from "@/features/applications/applicationsService";
import { useInterview } from "@/features/applications/hooks";
import type { InterviewMode } from "@/features/applications/schema";

const MODE_META: Record<
  InterviewMode,
  { label: string; icon: typeof Video; detail: string }
> = {
  video: { label: "Video call", icon: Video, detail: "Meeting link" },
  onsite: { label: "On-site", icon: MapPin, detail: "Location" },
  phone: { label: "Phone call", icon: Phone, detail: "They will call" },
};

type Choice = { id: string | null; starts_at: string; selected: boolean };

const timeLabel = (iso: string) =>
  new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
const dayLabel = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

function groupByDay(choices: Choice[]) {
  const groups = new Map<string, Choice[]>();
  for (const c of [...choices].sort((a, b) =>
    a.starts_at.localeCompare(b.starts_at),
  )) {
    const key = c.starts_at.slice(0, 10);
    const bucket = groups.get(key);
    if (bucket) bucket.push(c);
    else groups.set(key, [c]);
  }
  return [...groups.entries()];
}

export function InterviewPicker({ applicationId }: { applicationId: string }) {
  const { interview, loading, setInterview } = useInterview(applicationId);
  const [openSlots, setOpenSlots] = useState<Choice[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [changing, setChanging] = useState(false);

  const selfScheduled = interview?.self_scheduled ?? false;
  const selected = interview?.slots.find((s) => s.selected) ?? null;
  const showList = !!interview && (!selected || changing);
  const needOpenSlots = showList && selfScheduled;

  useEffect(() => {
    if (!needOpenSlots) return;
    let active = true;
    void getInterviewOpenSlots(applicationId)
      .then((slots) => {
        if (active)
          setOpenSlots(
            slots.map((s) => ({
              id: null,
              starts_at: s.starts_at,
              selected: s.starts_at === selected?.starts_at,
            })),
          );
      })
      .catch(() => active && setOpenSlots([]));
    return () => {
      active = false;
    };
  }, [needOpenSlots, applicationId, selected?.starts_at]);

  if (loading) return <Skeleton className="h-40 w-full" />;

  if (!interview) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Interview</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
          You&apos;re in the interview stage. The hiring team is setting up
          times — check back here shortly.
        </CardContent>
      </Card>
    );
  }

  const meta = MODE_META[interview.mode];
  const Icon = meta.icon;

  const choices: Choice[] = selfScheduled
    ? (openSlots ?? [])
    : interview.slots.map((s) => ({
        id: s.id,
        starts_at: s.starts_at,
        selected: s.selected,
      }));

  const pick = async (choice: Choice) => {
    setBusy(choice.starts_at);
    try {
      const next = await selectInterviewSlot(
        applicationId,
        choice.id ? { slot_id: choice.id } : { starts_at: choice.starts_at },
      );
      setInterview(next);
      setChanging(false);
      toast.success("Interview time confirmed");
    } catch {
      /* handled */
    } finally {
      setBusy(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {selected && !changing
            ? "Your interview"
            : "Choose your interview time"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
          <span className="flex items-center gap-1.5">
            <Icon className="size-4" /> {meta.label}
          </span>
          <span>{interview.duration_minutes} minutes</span>
          {interview.location_or_link ? (
            <span>
              {meta.detail}:{" "}
              <span className="text-foreground">
                {interview.location_or_link}
              </span>
            </span>
          ) : null}
        </div>

        {interview.notes ? (
          <p className="text-muted-foreground">{interview.notes}</p>
        ) : null}

        {selected && !changing ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3">
            <span className="flex items-center gap-2">
              <Check className="size-4 text-emerald-600" />
              <span>
                Confirmed for{" "}
                <span className="font-medium">
                  {dayLabel(selected.starts_at)}, {timeLabel(selected.starts_at)}
                </span>
              </span>
            </span>
            <Button variant="outline" size="sm" onClick={() => setChanging(true)}>
              Change time
            </Button>
          </div>
        ) : null}

        {showList ? (
          needOpenSlots && openSlots === null ? (
            <Skeleton className="h-20 w-full" />
          ) : choices.length === 0 ? (
            <p className="text-muted-foreground">
              No times are open right now — please check back later.
            </p>
          ) : (
            <div className="space-y-3">
              {groupByDay(choices).map(([key, day]) => (
                <div key={key} className="space-y-1.5">
                  <p className="text-muted-foreground text-xs font-medium">
                    {dayLabel(day[0].starts_at)}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {day.map((c) => (
                      <Button
                        key={c.starts_at}
                        variant={c.selected ? "default" : "outline"}
                        size="sm"
                        disabled={busy !== null}
                        onClick={() => pick(c)}
                        className={cn(busy === c.starts_at && "opacity-70")}
                      >
                        {timeLabel(c.starts_at)}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
              {changing ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setChanging(false)}
                >
                  Keep current time
                </Button>
              ) : null}
            </div>
          )
        ) : null}
      </CardContent>
    </Card>
  );
}
