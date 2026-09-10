"use client";

import type { UseFormReturn } from "react-hook-form";

import { FieldGroup } from "@/components/ui/field";
import { TextareaField, TextField } from "@/components/form/fields";
import type { TagInput } from "@/features/tags/schema";

export function TagForm({
  form,
}: {
  form: UseFormReturn<TagInput>;
}) {
  return (
    <FieldGroup>
      <TextField control={form.control} name="name" label="Name" required />
      <TextareaField
        control={form.control}
        name="description"
        label="Description"
      />
    </FieldGroup>
  );
}
