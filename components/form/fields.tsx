"use client";

import {
  type Control,
  type FieldPath,
  type FieldValues,
  Controller,
} from "react-hook-form";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AsyncCombobox, type ComboOption } from "@/components/form/async-combobox";

interface BaseProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
}

function LabelRow({
  htmlFor,
  label,
  required,
}: {
  htmlFor: string;
  label: string;
  required?: boolean;
}) {
  return (
    <FieldLabel htmlFor={htmlFor}>
      {label}
      {required ? <span className="text-destructive"> *</span> : null}
    </FieldLabel>
  );
}

export function TextField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder,
  required,
  type = "text",
  autoComplete,
}: BaseProps<T> & { type?: string; autoComplete?: string }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={!!fieldState.error}>
          <LabelRow htmlFor={name} label={label} required={required} />
          <Input
            {...field}
            id={name}
            type={type}
            autoComplete={autoComplete}
            placeholder={placeholder}
            value={field.value ?? ""}
            aria-invalid={!!fieldState.error}
          />
          {description ? <FieldDescription>{description}</FieldDescription> : null}
          <FieldError errors={fieldState.error ? [fieldState.error] : undefined} />
        </Field>
      )}
    />
  );
}

export function TextareaField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder,
  required,
  rows = 4,
}: BaseProps<T> & { rows?: number }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={!!fieldState.error}>
          <LabelRow htmlFor={name} label={label} required={required} />
          <Textarea
            {...field}
            id={name}
            rows={rows}
            placeholder={placeholder}
            value={field.value ?? ""}
            aria-invalid={!!fieldState.error}
          />
          {description ? <FieldDescription>{description}</FieldDescription> : null}
          <FieldError errors={fieldState.error ? [fieldState.error] : undefined} />
        </Field>
      )}
    />
  );
}

export function SelectField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder = "Select…",
  required,
  options,
}: BaseProps<T> & { options: { value: string; label: string }[] }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={!!fieldState.error}>
          <LabelRow htmlFor={name} label={label} required={required} />
          <Select
            value={field.value ?? ""}
            onValueChange={field.onChange}
          >
            <SelectTrigger id={name} aria-invalid={!!fieldState.error}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description ? <FieldDescription>{description}</FieldDescription> : null}
          <FieldError errors={fieldState.error ? [fieldState.error] : undefined} />
        </Field>
      )}
    />
  );
}

export function ComboField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder,
  required,
  options,
  clearable,
}: BaseProps<T> & { options: ComboOption[]; clearable?: boolean }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={!!fieldState.error}>
          <LabelRow htmlFor={name} label={label} required={required} />
          <AsyncCombobox
            id={name}
            options={options}
            value={field.value ?? null}
            onChange={(v) => field.onChange(v ?? "")}
            placeholder={placeholder}
            clearable={clearable}
            invalid={!!fieldState.error}
          />
          {description ? <FieldDescription>{description}</FieldDescription> : null}
          <FieldError errors={fieldState.error ? [fieldState.error] : undefined} />
        </Field>
      )}
    />
  );
}

export function CheckboxField<T extends FieldValues>({
  control,
  name,
  label,
  description,
}: BaseProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field orientation="horizontal" data-invalid={!!fieldState.error}>
          <Checkbox
            id={name}
            checked={!!field.value}
            onCheckedChange={field.onChange}
          />
          <FieldContent>
            <FieldLabel htmlFor={name}>{label}</FieldLabel>
            {description ? (
              <FieldDescription>{description}</FieldDescription>
            ) : null}
            <FieldError
              errors={fieldState.error ? [fieldState.error] : undefined}
            />
          </FieldContent>
        </Field>
      )}
    />
  );
}
