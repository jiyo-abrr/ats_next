import type { Metadata } from "next";

import { AvailabilityView } from "@/features/interviews/ui/ats/availability-view";

export const metadata: Metadata = { title: "Interview availability" };

export default function CalendarConfigPage() {
  return <AvailabilityView />;
}
