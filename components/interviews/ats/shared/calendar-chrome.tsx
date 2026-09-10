"use client";

import { LinkTabs } from "@/components/link-tabs";

export function CalendarChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-5">
      <LinkTabs
        items={[
          { href: "/ats/calendar", label: "Schedule" },
          { href: "/ats/calendar/config", label: "Availability" },
          { href: "/ats/calendar/overrides", label: "Date overrides" },
        ]}
      />
      <div>{children}</div>
    </div>
  );
}
