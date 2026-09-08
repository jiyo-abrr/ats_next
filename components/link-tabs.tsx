"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";

/**
 * Visually matches `components/ui/tabs.tsx`'s pill style, but each tab is a
 * real page navigation (its own route + URL-driven state) instead of a
 * client-side panel switch — for cases where each tab needs its own load.
 */
export function LinkTabs({ items }: { items: { href: string; label: string }[] }) {
  const pathname = usePathname();

  return (
    <div className="bg-muted text-muted-foreground inline-flex h-8 w-fit items-center justify-center rounded-lg p-[3px]">
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "inline-flex h-[calc(100%-1px)] items-center justify-center rounded-md px-3 text-sm font-medium transition-all",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-foreground/60 hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
