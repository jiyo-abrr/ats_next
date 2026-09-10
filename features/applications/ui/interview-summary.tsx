"use client";

import { Check, MapPin, Phone, Video } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils/format";
import { useInterview } from "@/features/applications/hooks";
import type { InterviewMode } from "@/features/applications/schema";

const ICON: Record<InterviewMode, typeof Video> = {
  video: Video,
  onsite: MapPin,
  phone: Phone,
};

/** Read-only summary of a confirmed interview — shown on the application detail
 * once the application has moved past the interview stage. Renders nothing if
 * there is no interview or no time was booked. */
export function InterviewSummary({ applicationId }: { applicationId: string }) {
  const { interview, loading } = useInterview(applicationId);
  if (loading || !interview) return null;

  const selected = interview.slots.find((s) => s.selected);
  if (!selected) return null;

  const Icon = ICON[interview.mode];

  return (
    <Card>
      <CardContent className="flex flex-wrap items-center gap-x-4 gap-y-1 p-4 text-sm">
        <span className="flex items-center gap-2 font-medium">
          <Check className="size-4 text-emerald-600" /> Interview
        </span>
        <span className="text-muted-foreground flex items-center gap-1.5 capitalize">
          <Icon className="size-4" /> {interview.mode}
        </span>
        <span className="tabular-nums">
          {formatDateTime(selected.starts_at)}
        </span>
        <span className="text-muted-foreground">
          {interview.duration_minutes} min
        </span>
        {interview.location_or_link ? (
          <span className="text-muted-foreground">
            {interview.location_or_link}
          </span>
        ) : null}
      </CardContent>
    </Card>
  );
}
