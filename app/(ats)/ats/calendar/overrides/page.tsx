import type { Metadata } from "next";

import { DateOverridesView } from "@/features/interviews/ui/ats/date-overrides-view";

export const metadata: Metadata = { title: "Date overrides" };

export default function CalendarOverridesPage() {
  return <DateOverridesView />;
}
