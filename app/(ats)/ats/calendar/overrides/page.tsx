import type { Metadata } from "next";

import { DateOverridesView } from "@/components/interviews/ats/date-overrides/date-overrides-view";

export const metadata: Metadata = { title: "Date overrides" };

export default function CalendarOverridesPage() {
  return <DateOverridesView />;
}
