"use client";

import { useCallback, useSyncExternalStore } from "react";

/** Wall-clock `Date.now()` as an external store — hydration-safe, no effect. */
function useNow(tickMs: number) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const t = setInterval(onChange, tickMs);
      return () => clearInterval(t);
    },
    [tickMs],
  );
  return useSyncExternalStore(
    subscribe,
    () => Date.now(),
    () => 0,
  );
}

function parts(ms: number) {
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return { d, h, m, sec };
}

/** Live-updating time-remaining label for an ISO deadline. */
export function Countdown({
  target,
  tickMs = 30_000,
  compact,
}: {
  target: string;
  tickMs?: number;
  compact?: boolean;
}) {
  const now = useNow(tickMs);

  const targetMs = new Date(target).getTime();
  if (Number.isNaN(targetMs)) return null;
  if (now === 0) return <span className="text-muted-foreground">…</span>;

  const remaining = targetMs - now;
  if (remaining <= 0) {
    return <span className="text-destructive font-medium">Overdue</span>;
  }

  const { d, h, m, sec } = parts(remaining);
  if (compact) {
    if (d > 0) return <span>{d}d {h}h left</span>;
    if (h > 0) return <span>{h}h {m}m left</span>;
    return <span>{m}m {sec}s left</span>;
  }
  return (
    <span>
      {d > 0 ? `${d}d ` : ""}
      {h > 0 || d > 0 ? `${h}h ` : ""}
      {m}m {d === 0 && h === 0 ? `${sec}s ` : ""}remaining
    </span>
  );
}
