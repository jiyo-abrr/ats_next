"use client";

import type { UseFormReturn } from "react-hook-form";

import { FieldGroup } from "@/components/ui/field";
import { TextareaField, TextField } from "@/components/form/fields";
import type { AssessmentTemplate, TemplateInput } from "@/features/templates/schema";

export function TemplateForm({ form }: { form: UseFormReturn<TemplateInput> }) {
  return (
    <FieldGroup>
      <TextField control={form.control} name="title" label="Title" required />
      <TextareaField
        control={form.control}
        name="description"
        label="Description"
        rows={2}
      />
      <TextareaField
        control={form.control}
        name="instructions"
        label="Instructions (shown to the applicant)"
        rows={3}
      />
      <TextField
        control={form.control}
        name="time_limit_minutes"
        label="Time limit (minutes)"
        type="number"
        description="Whole-attempt timer. Leave blank for none."
      />
    </FieldGroup>
  );
}

export function templateFormValues(t?: AssessmentTemplate): TemplateInput {
  return {
    title: t?.title ?? "",
    description: t?.description ?? "",
    instructions: t?.instructions ?? "",
    time_limit_minutes: t?.time_limit_minutes ? String(t.time_limit_minutes) : "",
  };
}

export function templateFormBody(v: TemplateInput) {
  return {
    title: v.title,
    description: v.description || null,
    instructions: v.instructions || null,
    time_limit_minutes: v.time_limit_minutes ? Number(v.time_limit_minutes) : null,
  };
}
