import { CalendarChrome } from "@/components/interviews/ats/shared/calendar-chrome";

export default function CalendarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CalendarChrome>{children}</CalendarChrome>;
}
