import { Check } from "lucide-react";

import { APPLICATION_STATUS } from "@/lib/constants";
import type { ApplicationStatus } from "@/lib/types";
import { cn } from "@/lib/cn";

const STAGES: ApplicationStatus[] = [
  "applied",
  "prescreening",
  "interview",
  "success",
];
const ORDER: Record<string, number> = {
  applied: 0,
  prescreening: 1,
  interview: 2,
  success: 3,
  failed: 3,
  denied: 3,
};

export function PipelineStepper({ status }: { status: ApplicationStatus }) {
  if (status === "withdrawn" || status === "disqualified") {
    const m = APPLICATION_STATUS[status];
    return (
      <p className="text-muted-foreground text-sm">
        Pipeline halted — application is <span className="font-medium">{m.label.toLowerCase()}</span>.
      </p>
    );
  }

  const currentOrder = ORDER[status] ?? 0;
  const failed = status === "failed" || status === "denied";

  return (
    <ol className="flex items-center">
      {STAGES.map((stage, i) => {
        const done = i < currentOrder;
        const active = i === currentOrder;
        const label =
          stage === "success" && failed
            ? APPLICATION_STATUS[status].label
            : APPLICATION_STATUS[stage].label;
        return (
          <li key={stage} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <span
                className={cn(
                  "grid size-7 place-items-center rounded-full border text-xs font-medium",
                  done && "bg-primary text-primary-foreground border-transparent",
                  active &&
                    !failed &&
                    "border-primary text-primary ring-primary/20 ring-4",
                  active && failed && "border-destructive text-destructive",
                  !done && !active && "text-muted-foreground",
                )}
              >
                {done ? <Check className="size-3.5" /> : i + 1}
              </span>
              <span
                className={cn(
                  "text-xs",
                  active ? "text-foreground font-medium" : "text-muted-foreground",
                )}
              >
                {label}
              </span>
            </div>
            {i < STAGES.length - 1 ? (
              <div
                className={cn(
                  "mx-1 h-px flex-1",
                  done ? "bg-primary" : "bg-border",
                )}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
