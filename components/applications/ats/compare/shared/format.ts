export function duration(start: string | null, end: string | null) {
  if (!start || !end) return null;
  const mins = Math.round(
    (new Date(end).getTime() - new Date(start).getTime()) / 60000,
  );
  if (mins <= 0) return null;
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

export function applicantName(a: { first: string; last: string }) {
  return `${a.first} ${a.last}`;
}
