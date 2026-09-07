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

/** Edit an existing question in place — returns the refreshed template. */
export const updateQuestion = (
  kind: TemplateKind,
  id: string,
  questionId: string,
  body: Record<string, unknown>,
) =>
  apiClient<AssessmentTemplate>(
    `${kind}-templates/${id}/questions/${questionId}`,
    { method: "PUT", body: JSON.stringify(body) },
  );

/** Delete a question — returns the refreshed template. */
export const deleteQuestion = (
  kind: TemplateKind,
  id: string,
  questionId: string,
) =>
  apiClient<AssessmentTemplate>(
    `${kind}-templates/${id}/questions/${questionId}`,
    { method: "DELETE" },
  );

/** Rewrite question order — `questionIds` must be the template's full set. */
export const reorderQuestions = (
  kind: TemplateKind,
  id: string,
  questionIds: string[],
) =>
  apiClient<AssessmentTemplate>(
    `${kind}-templates/${id}/questions/reorder`,
    { method: "PUT", body: JSON.stringify({ question_ids: questionIds }) },
  );
