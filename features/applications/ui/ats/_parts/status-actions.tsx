"use client";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { APPLICATION_STATUS } from "@/lib/constants";
import type { ApplicationStatus } from "@/lib/types";
import { useAppDispatch } from "@/lib/hooks/redux";
import { toast } from "@/lib/utils/toast";
import { changeApplicationStatus } from "@/lib/store/applicationsSlice";

const REJECTIONS = new Set<ApplicationStatus>(["denied", "failed"]);

export function StatusActions({
  id,
  transitions,
  acting,
}: {
  id: string;
  transitions: ApplicationStatus[];
  acting: boolean;
}) {
  const dispatch = useAppDispatch();

  if (transitions.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No further pipeline actions — this application is in a terminal state.
      </p>
    );
  }

  const move = async (status: ApplicationStatus) => {
    try {
      await dispatch(changeApplicationStatus({ id, status })).unwrap();
      toast.success(`Moved to ${APPLICATION_STATUS[status].label}`);
    } catch {
      /* handled */
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {transitions.map((status) => {
        const meta = APPLICATION_STATUS[status];
        const danger = REJECTIONS.has(status);
        const label = danger ? meta.label : `Move to ${meta.label}`;
        return danger ? (
          <ConfirmDialog
            key={status}
            trigger={
              <Button variant="destructive" size="sm" disabled={acting}>
                {label}
              </Button>
            }
            title={`Mark this application ${meta.label.toLowerCase()}?`}
            description="This is a terminal decision and can't be undone."
            destructive
            confirmLabel={meta.label}
            onConfirm={() => move(status)}
          />
        ) : (
          <Button
            key={status}
            size="sm"
            disabled={acting}
            onClick={() => move(status)}
          >
            {label}
          </Button>
        );
      })}
    </div>
  );
}
