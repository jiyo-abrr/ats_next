"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarClock } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FieldGroup } from "@/components/ui/field";
import { SelectField, TextareaField, TextField } from "@/components/form/fields";
import { useAppDispatch } from "@/lib/hooks/redux";
import { toast } from "@/lib/utils/toast";
import { extendAssessmentDeadline } from "@/lib/store/applicationsSlice";
import { type ExtendDeadlineInput, extendDeadlineSchema } from "@/features/applications/schema";

export function ExtendDeadlineDialog({
  id,
  onDone,
}: {
  id: string;
  onDone: () => void;
}) {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);

  const form = useForm<ExtendDeadlineInput>({
    resolver: zodResolver(extendDeadlineSchema),
    defaultValues: { reason: "", mode: "relative", extend_by_days: "4" },
  });
  // eslint-disable-next-line react-hooks/incompatible-library
  const mode = form.watch("mode");

  const onSubmit = form.handleSubmit(async (v) => {
    const body =
      v.mode === "relative"
        ? { reason: v.reason, extend_by_days: Number(v.extend_by_days) }
        : {
            reason: v.reason,
            new_deadline: new Date(v.new_deadline!).toISOString(),
          };
    try {
      await dispatch(extendAssessmentDeadline({ id, body })).unwrap();
      toast.success("Deadline extended");
      setOpen(false);
      form.reset({ reason: "", mode: "relative", extend_by_days: "4" });
      onDone();
    } catch {
      /* handled */
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <CalendarClock /> Extend deadline
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Extend assessment deadline</DialogTitle>
          <DialogDescription>
            Extending a disqualified application also reinstates it.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <FieldGroup>
            <SelectField
              control={form.control}
              name="mode"
              label="How"
              options={[
                { value: "relative", label: "Add days to the current deadline" },
                { value: "absolute", label: "Set a specific date" },
              ]}
            />
            {mode === "relative" ? (
              <TextField
                control={form.control}
                name="extend_by_days"
                label="Days to add"
                type="number"
                required
              />
            ) : (
              <TextField
                control={form.control}
                name="new_deadline"
                label="New deadline"
                type="datetime-local"
                required
              />
            )}
            <TextareaField
              control={form.control}
              name="reason"
              label="Reason"
              rows={3}
              required
            />
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Extending…" : "Extend"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
