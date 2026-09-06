import { apiClient } from "@/lib/api/client";
import type { Paginated } from "@/lib/types";
import type { Position } from "@/features/positions/schema";

export const getAll = (qs: string) =>
  apiClient<Paginated<Position>>(qs ? `positions?${qs}` : "positions");

export const create = (body: Record<string, unknown>) =>
  apiClient<Position>("positions", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const update = (id: string, body: Record<string, unknown>) =>
  apiClient<Position>(`positions/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });

export const remove = (id: string) =>
  apiClient<void>(`positions/${id}`, { method: "DELETE" });
