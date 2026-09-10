import { CalendarChrome } from "@/features/interviews/ui/ats/calendar-chrome";

export default function CalendarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CalendarChrome>{children}</CalendarChrome>;
}
