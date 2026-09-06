import { z } from "zod";

export type { User } from "@/lib/types";

// ---- Form schemas ----

export const loginSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
export type LoginInput = z.infer<typeof loginSchema>;

const MAX_RESUME_BYTES = 10 * 1024 * 1024; // 10 MB
const RESUME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export const signupSchema = z.object({
  first_name: z.string().min(1, "Required"),
  middle_initial: z.string().max(5, "Too long").optional().or(z.literal("")),
  last_name: z.string().min(1, "Required"),
  contact_number: z.string().min(1, "Required"),
  email: z.email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
  resume: z
    .instanceof(File, { message: "Attach your résumé" })
    .refine((f) => f.size > 0, "Attach your résumé")
    .refine((f) => f.size <= MAX_RESUME_BYTES, "Résumé must be under 10 MB")
    .refine(
      (f) => RESUME_TYPES.includes(f.type) || f.name.toLowerCase().endsWith(".pdf"),
      "Résumé must be a PDF or Word document",
    ),
});
export type SignupInput = z.infer<typeof signupSchema>;

export const createHrAccountSchema = z.object({
  first_name: z.string().min(1, "Required"),
  middle_initial: z.string().max(5).optional().or(z.literal("")),
  last_name: z.string().min(1, "Required"),
  contact_number: z.string().min(1, "Required"),
  email: z.email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
});
export type CreateHrAccountInput = z.infer<typeof createHrAccountSchema>;
