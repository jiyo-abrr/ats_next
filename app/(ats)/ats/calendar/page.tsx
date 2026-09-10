import type { Metadata } from "next";

import { ScheduleView } from "@/components/interviews/ats/schedule/schedule-view";

export const metadata: Metadata = { title: "Interview schedule" };

export default function CalendarSchedulePage() {
  return <ScheduleView />;
}
