import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/cn";

export function StatCard({
  label,
  value,
  hint,
  href,
  isLoading,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  hint?: string;
  href?: string;
  isLoading?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  const body = (
    <CardContent className="flex items-start justify-between gap-3 p-4">
      <div className="space-y-1">
        <p className="text-muted-foreground text-sm">{label}</p>
        {isLoading ? (
          <Skeleton className="h-7 w-12" />
        ) : (
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
        )}
        {hint ? (
          <p className="text-muted-foreground text-xs">{hint}</p>
        ) : null}
      </div>
      {Icon ? <Icon className="text-muted-foreground size-4" /> : null}
    </CardContent>
  );

  return (
    <Card className={cn(href && "hover:border-foreground/20 transition-colors")}>
      {href ? <Link href={href}>{body}</Link> : body}
    </Card>
  );
}
