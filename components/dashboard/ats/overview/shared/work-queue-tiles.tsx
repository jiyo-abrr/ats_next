"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  Check,
  Inbox,
  ListChecks,
  MessagesSquare,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/cn";

export type WorkQueueCounts = {
  applied: number;
  prescreening: number;
  interview: number;
  draft: number;
};

type Tile = {
  key: keyof WorkQueueCounts;
  label: string;
  hint: string;
  emptyHint: string;
  href: string;
  icon: typeof Inbox;
  accent: string;
};

const tiles: Tile[] = [
  {
    key: "applied",
    label: "New applications",
    hint: "waiting for a first review",
    emptyHint: "no one is waiting for review",
    href: "/ats/applications?f_status=applied",
    icon: Inbox,
    accent: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  {
    key: "prescreening",
    label: "In prescreening",
    hint: "assessments in progress",
    emptyHint: "nothing in prescreening",
    href: "/ats/applications?f_status=prescreening",
    icon: ListChecks,
    accent: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  {
    key: "interview",
    label: "Interview stage",
    hint: "awaiting a hiring decision",
    emptyHint: "no interviews pending a decision",
    href: "/ats/applications?f_status=interview",
    icon: MessagesSquare,
    accent: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  {
    key: "draft",
    label: "Draft job posts",
    hint: "not published yet",
    emptyHint: "every job post is published",
    href: "/ats/job-posts?f_status=draft",
    icon: CalendarClock,
    accent: "bg-muted text-muted-foreground",
  },
];

export function WorkQueueTiles({
  counts,
  loading = false,
}: {
  counts: WorkQueueCounts | null;
  loading?: boolean;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {tiles.map((tile) => {
        const n = counts?.[tile.key] ?? 0;
        const Icon = tile.icon;
        return (
          <Link key={tile.href} href={tile.href} className="group">
            <Card
              size="sm"
              className="hover:ring-foreground/25 h-full transition-[box-shadow,transform] group-hover:-translate-y-0.5"
            >
              <CardContent className="flex h-full flex-col gap-3">
                <div
                  className={cn(
                    "grid size-9 place-items-center rounded-lg",
                    tile.accent,
                  )}
                >
                  <Icon className="size-4.5" />
                </div>
                {loading && !counts ? (
                  <Skeleton className="h-9 w-12" />
                ) : n > 0 ? (
                  <p className="text-4xl font-semibold tracking-tight tabular-nums">
                    {n}
                  </p>
                ) : (
                  <p className="text-muted-foreground flex items-center gap-1 pt-2 text-sm font-medium">
                    <Check className="size-4" /> All clear
                  </p>
                )}
                <div className="mt-auto">
                  <p className="text-sm font-medium">{tile.label}</p>
                  <p className="text-muted-foreground text-xs">
                    {n > 0 ? tile.hint : tile.emptyHint}
                  </p>
                </div>
                <span className="text-muted-foreground group-hover:text-foreground inline-flex items-center gap-1 text-xs font-medium transition-colors">
                  Open
                  <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                </span>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
