import type { Metadata } from "next";

import { AvailabilityView } from "@/components/interviews/ats/availability/availability-view";

export const metadata: Metadata = { title: "Interview availability" };

export default function CalendarConfigPage() {
  return <AvailabilityView />;
}
