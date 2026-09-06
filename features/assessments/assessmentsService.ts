import { apiClient } from "@/lib/api/client";
import type { AttemptDetail } from "@/features/assessments/schema";

export const getAttempt = (id: string) =>
  apiClient<AttemptDetail>(`assessment-attempts/${id}`);

export const startQuestion = (attemptId: string, questionId: string) =>
  apiClient<unknown>(
    `assessment-attempts/${attemptId}/questions/${questionId}/start`,
    { method: "POST" },
  );

export const submitAnswer = (
  attemptId: string,
  questionId: string,
  answerValue: unknown,
) =>
  apiClient<unknown>(
    `assessment-attempts/${attemptId}/questions/${questionId}/answer`,
    { method: "POST", body: JSON.stringify({ answer_value: answerValue }) },
  );
