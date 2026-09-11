"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, ChevronLeft, ChevronRight } from "lucide-react";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/states";
import { AddressMap } from "@/components/address-map";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { errorMessage } from "@/lib/api/client";
import { cn } from "@/lib/cn";
import { toast } from "@/lib/utils/toast";
import {
  getInterviewOpenSlots,
  selectInterviewSlot,
} from "@/features/applications/applicationsService";
import { useInterview } from "@/features/applications/hooks";
import { dayLabel, MODE_META, timeLabel } from "../detail/interview/mode-meta";

type Choice = { id: string | null; starts_at: string; selected: boolean };

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function localDayKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}
/** Inverse of `localDayKey` — a "YYYY-MM-DD" key parsed back to that local
 * calendar date (never through `new Date(key)`, which treats a bare date as
 * UTC and can land on the wrong day for viewers behind UTC). */
function parseLocalKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}
const sameMonth = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
const isToday = (d: Date) => localDayKey(d) === localDayKey(new Date());

export function InterviewScheduleView({
  applicationId,
}: {
  applicationId: string;
}) {
  const router = useRouter();
  const { interview, loading, error, setInterview } = useInterview(applicationId);
  const [openSlots, setOpenSlots] = useState<Choice[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  // null = "follow the data" (land on the first day with open times); once the
  // visitor clicks a day or a month arrow, these take over.
  const [pickedDay, setPickedDay] = useState<string | null>(null);
  const [pickedCursor, setPickedCursor] = useState<Date | null>(null);
  const [pendingChoice, setPendingChoice] = useState<Choice | null>(null);

  const selfScheduled = interview?.self_scheduled ?? false;
  const currentlySelected = interview?.slots.find((s) => s.selected) ?? null;

  useEffect(() => {
    if (!interview || !selfScheduled) return;
    let active = true;
    void getInterviewOpenSlots(applicationId)
      .then((slots) => {
        if (active)
          setOpenSlots(
            slots.map((s) => ({
              id: null,
              starts_at: s.starts_at,
              selected: s.starts_at === currentlySelected?.starts_at,
            })),
          );
      })
      .catch(() => active && setOpenSlots([]));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId, selfScheduled, !!interview]);

  const choices: Choice[] = useMemo(
    () =>
      selfScheduled
        ? (openSlots ?? [])
        : (interview?.slots.map((s) => ({
            id: s.id,
            starts_at: s.starts_at,
            selected: s.selected,
          })) ?? []),
    [selfScheduled, openSlots, interview],
  );

  const byDay = useMemo(() => {
    const groups = new Map<string, Choice[]>();
    for (const c of choices) {
      const key = localDayKey(new Date(c.starts_at));
      const bucket = groups.get(key);
      if (bucket) bucket.push(c);
      else groups.set(key, [c]);
    }
    for (const [, bucket] of groups) {
      bucket.sort((a, b) => a.starts_at.localeCompare(b.starts_at));
    }
    return groups;
  }, [choices]);

  const loaded = !loading && (!selfScheduled || openSlots !== null);
  const firstDayWithTimes = useMemo(
    () => [...byDay.keys()].sort()[0] ?? null,
    [byDay],
  );
  const selectedDay = pickedDay ?? firstDayWithTimes;
  const cursor =
    pickedCursor ??
    (firstDayWithTimes ? parseLocalKey(firstDayWithTimes) : new Date());

  if (error)
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <ErrorState message="Couldn't load this interview." />
      </div>
    );

  if (loading || !interview) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 px-4 py-10">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-[28rem] w-full" />
      </div>
    );
  }

  const meta = MODE_META[interview.mode];
  const Icon = meta.icon;

  const pick = async (choice: Choice) => {
    setBusy(choice.starts_at);
    try {
      const next = await selectInterviewSlot(
        applicationId,
        choice.id ? { slot_id: choice.id } : { starts_at: choice.starts_at },
      );
      setInterview(next);
      setPendingChoice(null);
      toast.success("Interview time confirmed");
      router.push(`/applications/${applicationId}`);
    } catch (e) {
      // Surface the failure — e.g. "that time was just taken" — instead of
      // leaving the dialog looking like the click did nothing.
      toast.error(errorMessage(e));
      setPendingChoice(null);
      if (selfScheduled) {
        void getInterviewOpenSlots(applicationId)
          .then((slots) =>
            setOpenSlots(
              slots.map((s) => ({
                id: null,
                starts_at: s.starts_at,
                selected: s.starts_at === currentlySelected?.starts_at,
              })),
            ),
          )
          .catch(() => undefined);
      }
    } finally {
      setBusy(null);
    }
  };

  // Monday-first 6×7 month grid.
  const cells = (() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const start = new Date(first);
    start.setDate(first.getDate() - ((first.getDay() + 6) % 7));
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  })();
  const monthTitle = cursor.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
  const dayChoices = selectedDay ? (byDay.get(selectedDay) ?? []) : [];

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-10">
      <Breadcrumbs
        items={[
          { label: "My applications", href: "/applications" },
          {
            label: "Application",
            href: `/applications/${applicationId}`,
          },
          { label: "Schedule" },
        ]}
      />

      <Link
        href={`/applications/${applicationId}`}
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="size-4" /> Back to application
      </Link>

      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Choose your interview time
        </h1>
        <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
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
          <p className="text-muted-foreground text-sm">{interview.notes}</p>
        ) : null}
        {interview.address ? (
          <AddressMap
            latitude={interview.address.latitude}
            longitude={interview.address.longitude}
            label={interview.address.label}
          />
        ) : null}
      </div>

      {currentlySelected ? (
        <div className="flex items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm">
          <Check className="size-4 shrink-0 text-emerald-600" />
          <span>
            Currently confirmed for{" "}
            <span className="font-medium">
              {dayLabel(currentlySelected.starts_at)},{" "}
              {timeLabel(currentlySelected.starts_at)}
            </span>
            . Pick a new time below to change it.
          </span>
        </div>
      ) : null}

      {!loaded ? (
        <Skeleton className="h-[28rem] w-full" />
      ) : choices.length === 0 ? (
        <Card>
          <CardContent className="text-muted-foreground p-6 text-center text-sm">
            No times are open right now — please check back later.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="grid gap-6 pt-6 md:grid-cols-[1fr_16rem]">
            {/* calendar */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-medium">{monthTitle}</p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8"
                    aria-label="Previous month"
                    onClick={() =>
                      setPickedCursor(
                        new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1),
                      )
                    }
                  >
                    <ChevronLeft />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8"
                    aria-label="Next month"
                    onClick={() =>
                      setPickedCursor(
                        new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1),
                      )
                    }
                  >
                    <ChevronRight />
                  </Button>
                </div>
              </div>

              <div className="overflow-hidden rounded-lg border">
                <div className="bg-muted/40 grid grid-cols-7 border-b text-center">
                  {WEEKDAYS.map((d) => (
                    <div
                      key={d}
                      className="text-muted-foreground py-1.5 text-[11px] font-medium"
                    >
                      {d}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7">
                  {cells.map((day, i) => {
                    const key = localDayKey(day);
                    const has = byDay.has(key);
                    const inMonth = sameMonth(day, cursor);
                    return (
                      <button
                        key={i}
                        type="button"
                        disabled={!has}
                        onClick={() => setPickedDay(key)}
                        className={cn(
                          "relative flex aspect-square flex-col items-center justify-center border-r border-b text-sm [&:nth-child(7n)]:border-r-0",
                          i >= 35 && "border-b-0",
                          !inMonth && "text-muted-foreground/40",
                          has &&
                            "hover:bg-primary/10 text-foreground font-medium",
                          !has && "text-muted-foreground/60",
                          selectedDay === key &&
                            "bg-primary text-primary-foreground hover:bg-primary",
                        )}
                      >
                        <span
                          className={cn(
                            isToday(day) &&
                              selectedDay !== key &&
                              "text-primary font-semibold",
                          )}
                        >
                          {day.getDate()}
                        </span>
                        {has && selectedDay !== key ? (
                          <span className="bg-primary absolute bottom-1.5 size-1 rounded-full" />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
              <p className="text-muted-foreground text-xs">
                Days with a dot have open times.
              </p>
            </div>

            {/* times for the selected day */}
            <div className="space-y-2">
              <p className="text-sm font-medium">
                {selectedDay
                  ? parseLocalKey(selectedDay).toLocaleDateString(undefined, {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })
                  : "Pick a day"}
              </p>
              {dayChoices.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  {selectedDay
                    ? "No times this day."
                    : "Select a highlighted day on the calendar."}
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {dayChoices.map((c) => (
                    <Button
                      key={c.starts_at}
                      variant={c.selected ? "default" : "outline"}
                      disabled={busy !== null}
                      onClick={() => setPendingChoice(c)}
                      className={cn(
                        "justify-center",
                        busy === c.starts_at && "opacity-70",
                      )}
                    >
                      {timeLabel(c.starts_at)}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <AlertDialog
        open={pendingChoice !== null}
        onOpenChange={(open) => !open && setPendingChoice(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm this interview time?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingChoice
                ? `${dayLabel(pendingChoice.starts_at)} at ${timeLabel(
                    pendingChoice.starts_at,
                  )} · ${interview.duration_minutes} minutes · ${meta.label}.`
                : null}
              {currentlySelected &&
              pendingChoice &&
              currentlySelected.starts_at !== pendingChoice.starts_at
                ? " This replaces your current confirmed time."
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {/* Plain Buttons, not AlertDialogCancel/AlertDialogAction — those
            are Radix's Dialog.Close underneath, which auto-closes on click
            and can race an async confirm. Both are fully driven by our own
            `pendingChoice` state instead. */}
          <AlertDialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={busy !== null}
              onClick={() => setPendingChoice(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={busy !== null}
              onClick={() => pendingChoice && pick(pendingChoice)}
            >
              {busy !== null ? "Confirming…" : "Confirm"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
