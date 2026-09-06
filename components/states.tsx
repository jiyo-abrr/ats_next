import { AlertCircle, Inbox } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

export function EmptyState({
  title = "Nothing here yet",
  description,
  action,
  icon: Icon = Inbox,
  className,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-16 text-center",
        className,
      )}
    >
      <Icon className="text-muted-foreground size-8" />
      <p className="font-medium">{title}</p>
      {description ? (
        <p className="text-muted-foreground max-w-sm text-sm">{description}</p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  message = "Something went wrong.",
  onRetry,
  className,
}: {
  message?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-16 text-center",
        className,
      )}
    >
      <AlertCircle className="text-destructive size-8" />
      <p className="text-muted-foreground max-w-sm text-sm">{message}</p>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}
