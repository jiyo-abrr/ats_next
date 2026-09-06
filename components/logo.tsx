import Link from "next/link";

import { APP_NAME } from "@/lib/config";
import { cn } from "@/lib/cn";

export function Logo({
  href = "/",
  subtitle,
  className,
}: {
  href?: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <Link href={href} className={cn("flex items-center gap-2", className)}>
      <span className="bg-primary text-primary-foreground grid size-7 place-items-center rounded-md text-sm font-bold">
        {APP_NAME.slice(0, 1)}
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-sm font-semibold tracking-tight">{APP_NAME}</span>
        {subtitle ? (
          <span className="text-muted-foreground text-[11px]">{subtitle}</span>
        ) : null}
      </span>
    </Link>
  );
}
