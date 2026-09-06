import { z } from "zod";

export interface Tag {
  id: string;
  name: string;
  description: string | null;
}

const optionalText = z.string().trim().max(2000).optional();

export const tagSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  description: optionalText,
});
export type TagInput = z.infer<typeof tagSchema>;
