import { z } from "zod";

export interface CompanyAddress {
  id: string;
  label: string;
  line1: string;
  line2: string | null;
  city: string;
  state_province: string | null;
  postal_code: string | null;
  country: string;
  latitude: string | null;
  longitude: string | null;
  created_at: string;
  updated_at: string;
}

const numericString = z
  .string()
  .trim()
  .optional()
  .refine((v) => !v || !Number.isNaN(Number(v)), "Must be a number");

export const companyAddressSchema = z.object({
  label: z.string().trim().min(1, "Label is required").max(200),
  line1: z.string().trim().min(1, "Address line 1 is required").max(200),
  line2: z.string().trim().max(200).optional(),
  city: z.string().trim().min(1, "City is required").max(120),
  state_province: z.string().trim().max(200).optional(),
  postal_code: z.string().trim().max(200).optional(),
  country: z.string().trim().min(1, "Country is required").max(120),
  latitude: numericString,
  longitude: numericString,
});
export type CompanyAddressInput = z.infer<typeof companyAddressSchema>;
