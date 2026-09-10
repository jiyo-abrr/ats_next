"use client";

import type { UseFormReturn } from "react-hook-form";

import { FieldGroup } from "@/components/ui/field";
import {
  ComboField,
  RichTextField,
  SelectField,
  TextField,
} from "@/components/form/fields";
import type { ComboOption } from "@/components/form/async-combobox";
import {
  CURRENCY_OPTIONS,
  EMPLOYMENT_TYPE_LABELS,
  JOB_POST_STATUS,
} from "@/lib/constants";
import type { JobPostInput } from "@/features/job-posts/schema";

const employmentOptions = Object.entries(EMPLOYMENT_TYPE_LABELS).map(
  ([value, label]) => ({ value, label }),
);
const allStatusOptions = Object.entries(JOB_POST_STATUS).map(([value, m]) => ({
  value,
  label: m.label,
}));

export function JobPostForm({
  form,
  positions,
  addresses,
  assessmentsComplete = true,
  currentStatus,
}: {
  form: UseFormReturn<JobPostInput>;
  positions: ComboOption[];
  addresses: ComboOption[];
  /** All 3 assessments attached? When false, Published is not selectable. */
  assessmentsComplete?: boolean;
  currentStatus?: string;
}) {
  const canPublish = assessmentsComplete || currentStatus === "published";
  const statusOptions = canPublish
    ? allStatusOptions
    : allStatusOptions.filter((o) => o.value !== "published");
  return (
    <FieldGroup>
      <TextField
        control={form.control}
        name="job_title"
        label="Job title"
        required
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <ComboField
          control={form.control}
          name="position_id"
          label="Position"
          placeholder="Select a position"
          options={positions}
          required
        />
        <ComboField
          control={form.control}
          name="company_address_id"
          label="Location"
          placeholder="Select a location"
          options={addresses}
          required
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField
          control={form.control}
          name="employment_type"
          label="Employment type"
          options={employmentOptions}
          required
        />
        <div>
          <SelectField
            control={form.control}
            name="status"
            label="Status"
            options={statusOptions}
            required
          />
          {!canPublish ? (
            <p className="text-muted-foreground mt-1.5 text-xs">
              Attach all three assessments (Assessments tab) to publish this
              job post.
            </p>
          ) : null}
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-4">
        <SelectField
          control={form.control}
          name="currency"
          label="Currency"
          options={CURRENCY_OPTIONS}
          required
        />
        <TextField
          control={form.control}
          name="salary_min"
          label="Salary min"
          placeholder="0"
        />
        <TextField
          control={form.control}
          name="salary_max"
          label="Salary max"
          placeholder="0"
        />
        <TextField
          control={form.control}
          name="assessment_window_days"
          label="Assessment window (days)"
          type="number"
        />
      </div>
      <RichTextField
        control={form.control}
        name="description"
        label="About the role"
        placeholder="What the role is, the team, day-to-day…"
        required
      />
      <RichTextField
        control={form.control}
        name="requirements"
        label="Requirements"
        placeholder="Must-have skills and experience"
        required
      />
      <RichTextField
        control={form.control}
        name="qualifications"
        label="Qualifications"
        placeholder="Education, certifications, nice-to-haves"
        required
      />
    </FieldGroup>
  );
}

/** Map a JobPost (or nothing) → RHF default values. */
export function jobPostFormValues(job?: {
  job_title: string;
  description: string;
  requirements: string;
  qualifications: string;
  salary_min: string | null;
  salary_max: string | null;
  currency: string;
  employment_type: string;
  status: string;
  company_address_id: string;
  position_id: string;
  assessment_window_days: number;
}): JobPostInput {
  return {
    job_title: job?.job_title ?? "",
    description: job?.description ?? "",
    requirements: job?.requirements ?? "",
    qualifications: job?.qualifications ?? "",
    salary_min: job?.salary_min ? String(Number(job.salary_min)) : "",
    salary_max: job?.salary_max ? String(Number(job.salary_max)) : "",
    currency: (job?.currency ?? "PHP") as JobPostInput["currency"],
    employment_type: (job?.employment_type ??
      "full_time") as JobPostInput["employment_type"],
    status: (job?.status ?? "draft") as JobPostInput["status"],
    company_address_id: job?.company_address_id ?? "",
    position_id: job?.position_id ?? "",
    assessment_window_days: String(job?.assessment_window_days ?? 4),
  };
}

export function jobPostFormBody(values: JobPostInput) {
  return {
    ...values,
    salary_min: values.salary_min ? Number(values.salary_min) : null,
    salary_max: values.salary_max ? Number(values.salary_max) : null,
    assessment_window_days: Number(values.assessment_window_days),
  };
}
