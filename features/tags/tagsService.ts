import { apiClient } from "@/lib/api/client";
import type { Paginated } from "@/lib/types";
import type { Tag } from "@/features/tags/schema";

export const getAll = (qs: string) =>
  apiClient<Paginated<Tag>>(qs ? `tags?${qs}` : "tags");

export const create = (body: Record<string, unknown>) =>
  apiClient<Tag>("tags", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const update = (id: string, body: Record<string, unknown>) =>
  apiClient<Tag>(`tags/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });

export const remove = (id: string) =>
  apiClient<void>(`tags/${id}`, { method: "DELETE" });
