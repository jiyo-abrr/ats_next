import { apiClient } from "@/lib/api/client";
import type { Paginated } from "@/lib/types";
import type { JobPost } from "@/features/job-posts/schema";

export const getAll = (qs: string) =>
  apiClient<Paginated<JobPost>>(qs ? `job-posts?${qs}` : "job-posts");

export const getById = (id: string) => apiClient<JobPost>(`job-posts/${id}`);

export const create = (body: Record<string, unknown>) =>
  apiClient<JobPost>("job-posts", { method: "POST", body: JSON.stringify(body) });

export const update = (id: string, body: Record<string, unknown>) =>
  apiClient<JobPost>(`job-posts/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });

export const remove = (id: string) =>
  apiClient<void>(`job-posts/${id}`, { method: "DELETE" });

// ---- relationship management (each returns the refreshed JobPost) ----
const rel =
  (verb: "POST" | "DELETE") =>
  (id: string, path: string) =>
    apiClient<JobPost>(`job-posts/${id}/${path}`, { method: verb });

export const addTag = (id: string, tagId: string) =>
  rel("POST")(id, `tags/${tagId}`);
export const removeTag = (id: string, tagId: string) =>
  rel("DELETE")(id, `tags/${tagId}`);

export const addExclusion = (id: string, excludedId: string) =>
  rel("POST")(id, `exclusions/${excludedId}`);
export const removeExclusion = (id: string, excludedId: string) =>
  rel("DELETE")(id, `exclusions/${excludedId}`);

/** kind: "pre-assessment" | "culture-fit" | "technical-assessment" */
export const setTemplate = (id: string, kind: string, templateId: string) =>
  rel("POST")(id, `${kind}-templates/${templateId}`);
export const removeTemplate = (id: string, kind: string, templateId: string) =>
  rel("DELETE")(id, `${kind}-templates/${templateId}`);
