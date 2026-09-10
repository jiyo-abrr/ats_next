/** Offset (ms) to add to a UTC instant to get the wall-clock time in `timeZone`. */
function tzOffsetMs(instant: Date, timeZone: string): number {
  const s = instant.toLocaleString("en-US", { timeZone, hour12: false });
  // "9/11/2026, 17:00:00"  (en-US, 24h)
  const [datePart, timePart] = s.split(", ");
  const [mo, d, y] = datePart.split("/").map(Number);
  const [hh, mm, ss] = timePart.split(":").map(Number);
  return (
    Date.UTC(y, mo - 1, d, hh, mm, ss % 60) - instant.getTime()
  );
}

/** The instant that is `hh:mm` wall-clock in `timeZone` on the given calendar
 * date. Used to place availability windows (stored as wall time in the config
 * timezone) onto a calendar rendered in the viewer's local time. */
export function zonedWallTime(
  year: number,
  monthIndex: number,
  day: number,
  hhmm: string,
  timeZone: string,
): Date {
  const [h, m] = hhmm.split(":").map(Number);
  const utcGuess = Date.UTC(year, monthIndex, day, h, m);
  const offset = tzOffsetMs(new Date(utcGuess), timeZone);
  return new Date(utcGuess - offset);
}
