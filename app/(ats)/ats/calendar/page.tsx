import type { Metadata } from "next";

import { ScheduleView } from "@/features/interviews/ui/ats/schedule-view";

export const metadata: Metadata = { title: "Interview schedule" };

export default function CalendarSchedulePage() {
  return <ScheduleView />;
}
