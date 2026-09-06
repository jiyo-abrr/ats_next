"use client";

import type { UseFormReturn } from "react-hook-form";

import { FieldGroup } from "@/components/ui/field";
import { TextareaField, TextField } from "@/components/form/fields";
import type { PositionInput } from "@/features/positions/schema";

export function PositionForm({
  form,
}: {
  form: UseFormReturn<PositionInput>;
}) {
  return (
    <FieldGroup>
      <TextField control={form.control} name="title" label="Title" required />
      <TextareaField
        control={form.control}
        name="description"
        label="Description"
      />
    </FieldGroup>
  );
}
