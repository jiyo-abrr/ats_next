"use client";

import type { UseFormReturn } from "react-hook-form";

import { FieldGroup } from "@/components/ui/field";
import { TextField } from "@/components/form/fields";
import type { CompanyAddressInput } from "@/features/company-addresses/schema";

export function CompanyAddressForm({
  form,
}: {
  form: UseFormReturn<CompanyAddressInput>;
}) {
  return (
    <FieldGroup>
      <TextField
        control={form.control}
        name="label"
        label="Label"
        placeholder="HQ, Cebu office…"
        required
      />
      <TextField
        control={form.control}
        name="line1"
        label="Address line 1"
        required
      />
      <TextField control={form.control} name="line2" label="Address line 2" />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField control={form.control} name="city" label="City" required />
        <TextField
          control={form.control}
          name="state_province"
          label="State / province"
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          control={form.control}
          name="postal_code"
          label="Postal code"
        />
        <TextField
          control={form.control}
          name="country"
          label="Country"
          required
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField control={form.control} name="latitude" label="Latitude" />
        <TextField control={form.control} name="longitude" label="Longitude" />
      </div>
    </FieldGroup>
  );
}
