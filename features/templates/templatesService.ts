import { apiClient } from "@/lib/api/client";
import type { Paginated } from "@/lib/types";
import type { AssessmentTemplate, TemplateKind } from "@/features/templates/schema";

/** `<kind>-templates` — three parallel domains, `manage_jobs`-gated, `?page=&size=`. */
export const list = (kind: TemplateKind, qs = "") =>
  apiClient<Paginated<AssessmentTemplate>>(
    qs ? `${kind}-templates?${qs}` : `${kind}-templates`,
  );

export const get = (kind: TemplateKind, id: string) =>
  apiClient<AssessmentTemplate>(`${kind}-templates/${id}`);

export const create = (kind: TemplateKind, body: Record<string, unknown>) =>
  apiClient<AssessmentTemplate>(`${kind}-templates`, {
    method: "POST",
    body: JSON.stringify(body),
  });

export const update = (
  kind: TemplateKind,
  id: string,
  body: Record<string, unknown>,
) =>
  apiClient<AssessmentTemplate>(`${kind}-templates/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });

export const remove = (kind: TemplateKind, id: string) =>
  apiClient<void>(`${kind}-templates/${id}`, { method: "DELETE" });

/** Append a question — returns the refreshed template. */
export const addQuestion = (
  kind: TemplateKind,
  id: string,
  body: Record<string, unknown>,
) =>
  apiClient<AssessmentTemplate>(`${kind}-templates/${id}/questions`, {
    method: "POST",
    body: JSON.stringify(body),
  });
