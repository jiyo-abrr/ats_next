import { z } from "zod";

export interface Position {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

const optionalText = z.string().trim().max(2000).optional();

export const positionSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: optionalText,
});
export type PositionInput = z.infer<typeof positionSchema>;
