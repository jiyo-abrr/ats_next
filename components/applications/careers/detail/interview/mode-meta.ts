import { MapPin, Phone, Video } from "lucide-react";

import type { InterviewMode } from "@/features/applications/schema";

export const MODE_META: Record<
  InterviewMode,
  { label: string; icon: typeof Video; detail: string }
> = {
  video: { label: "Video call", icon: Video, detail: "Meeting link" },
  onsite: { label: "On-site", icon: MapPin, detail: "Location" },
  phone: { label: "Phone call", icon: Phone, detail: "They will call" },
};

export const timeLabel = (iso: string) =>
  new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

export const dayLabel = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
