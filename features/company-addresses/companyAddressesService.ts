import { apiClient } from "@/lib/api/client";
import type { Paginated } from "@/lib/types";
import type { CompanyAddress } from "@/features/company-addresses/schema";

export const getAll = (qs: string) =>
  apiClient<Paginated<CompanyAddress>>(qs ? `company-addresses?${qs}` : "company-addresses");

export const create = (body: Record<string, unknown>) =>
  apiClient<CompanyAddress>("company-addresses", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const update = (id: string, body: Record<string, unknown>) =>
  apiClient<CompanyAddress>(`company-addresses/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });

export const remove = (id: string) =>
  apiClient<void>(`company-addresses/${id}`, { method: "DELETE" });
