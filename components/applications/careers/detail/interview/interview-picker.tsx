"use client";

import Link from "next/link";
import { Check, ChevronRight } from "lucide-react";

import { AddressMap } from "@/components/address-map";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useInterview } from "@/features/applications/hooks";
import { dayLabel, MODE_META, timeLabel } from "./mode-meta";

/** Compact summary shown on the application page — the actual day/time
 * picker lives on its own page (a candidate can have 100+ open slots, which
 * doesn't fit well inline). */
export function InterviewPicker({ applicationId }: { applicationId: string }) {
  const { interview, loading } = useInterview(applicationId);

  if (loading) return <Skeleton className="h-32 w-full" />;

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
  const selected = interview.slots.find((s) => s.selected) ?? null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{selected ? "Your interview" : "Interview"}</CardTitle>
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

        {selected ? (
          <>
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
              <Button variant="outline" size="sm" asChild>
                <Link href={`/applications/${applicationId}/schedule`}>
                  Change time
                </Link>
              </Button>
            </div>
            {interview.address ? (
              <AddressMap
                latitude={interview.address.latitude}
                longitude={interview.address.longitude}
                label={interview.address.label}
              />
            ) : null}
          </>
        ) : (
          <Button asChild>
            <Link href={`/applications/${applicationId}/schedule`}>
              Choose your interview time <ChevronRight className="size-4" />
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
