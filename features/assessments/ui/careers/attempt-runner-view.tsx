"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2, CircleAlert, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Countdown } from "@/components/countdown";
import { ErrorState } from "@/components/states";
import { TEMPLATE_TYPE_LABELS } from "@/lib/constants";
import { useAppDispatch } from "@/lib/hooks/redux";
import {
  type AnswerValue,
  AnswerInput,
  isAnswerComplete,
} from "./answer-input";
import { startQuestion, submitAnswer } from "@/lib/store/assessmentsSlice";
import { useAttempt } from "@/features/assessments/hooks";

function attemptDeadline(startedAt: string | null, minutes: number | null) {
  if (!startedAt || !minutes) return null;
  return new Date(new Date(startedAt).getTime() + minutes * 60_000).toISOString();
}

export function AttemptRunnerView({ attemptId }: { attemptId: string }) {
  const dispatch = useAppDispatch();
  const { attempt, loading, error, submitting, refetch } = useAttempt(attemptId);

  const [value, setValue] = useState<AnswerValue>(null);
  const [answeredQuestionId, setAnsweredQuestionId] = useState<string | null>(
    null,
  );
  const startedFor = useRef<string | null>(null);

  const currentQuestion = attempt?.current_question ?? null;
  const currentId = currentQuestion?.id ?? null;

  if (currentId !== answeredQuestionId) {
    setAnsweredQuestionId(currentId);
    setValue(null);
  }

  useEffect(() => {
    if (
      !attempt ||
      !currentId ||
      attempt.current_question_started_at ||
      startedFor.current === currentId
    ) {
      return;
    }
    startedFor.current = currentId;
    dispatch(startQuestion({ attemptId, questionId: currentId }))
      .unwrap()
      .then(() => refetch())
      .catch(() => {
        startedFor.current = null;
      });
  }, [attempt, currentId, attemptId, dispatch, refetch]);

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <ErrorState message="This assessment could not be loaded." onRetry={refetch} />
      </div>
    );
  }
  if (loading || !attempt) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 px-4 py-10">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const backHref = `/applications/${attempt.application_id}`;

  if (attempt.status === "completed") {
    return (
      <ResultCard
        icon={<CheckCircle2 className="size-10 text-emerald-600" />}
        title="Assessment submitted"
        body={`You answered all ${attempt.total_questions} questions for the ${TEMPLATE_TYPE_LABELS[attempt.template_type].toLowerCase()} assessment.`}
        backHref={backHref}
      />
    );
  }
  if (attempt.status === "expired") {
    return (
      <ResultCard
        icon={<CircleAlert className="size-10 text-red-600" />}
        title="Time expired"
        body="The time limit for this assessment has passed. The hiring team can reopen it if needed."
        backHref={backHref}
      />
    );
  }
  if (!currentQuestion) {
    return (
      <ResultCard
        icon={<CheckCircle2 className="size-10 text-emerald-600" />}
        title="Nothing left to answer"
        body="All available questions have been completed."
        backHref={backHref}
      />
    );
  }

  const pct = attempt.total_questions
    ? Math.round((attempt.answered_count / attempt.total_questions) * 100)
    : 0;
  const attemptEnd = attemptDeadline(
    attempt.started_at,
    attempt.time_limit_minutes,
  );
  const questionEnd =
    currentQuestion.time_limit_seconds && attempt.current_question_started_at
      ? new Date(
          new Date(attempt.current_question_started_at).getTime() +
            currentQuestion.time_limit_seconds * 1000,
        ).toISOString()
      : null;

  const onSubmit = async () => {
    try {
      await dispatch(
        submitAnswer({
          attemptId,
          questionId: currentQuestion.id,
          answerValue: value,
          applicationId: attempt.application_id,
        }),
      ).unwrap();
      startedFor.current = null;
      await refetch();
    } catch {
      /* toast handled by middleware */
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5 px-4 py-10">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">
            {TEMPLATE_TYPE_LABELS[attempt.template_type]}
          </span>
          {attemptEnd ? (
            <span className="text-muted-foreground flex items-center gap-1">
              <Clock className="size-3.5" />
              <Countdown target={attemptEnd} compact />
            </span>
          ) : null}
        </div>
        <Progress value={pct} />
        <p className="text-muted-foreground text-xs">
          {attempt.answered_count} of {attempt.total_questions} answered
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base leading-snug">
            {currentQuestion.prompt}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <AnswerInput
            question={currentQuestion}
            value={value}
            onChange={setValue}
          />
          {questionEnd ? (
            <p className="text-muted-foreground text-xs">
              This question closes in <Countdown target={questionEnd} compact />
            </p>
          ) : null}
          <div className="flex justify-end gap-2 pt-2">
            <Button asChild variant="ghost">
              <Link href={backHref}>Save &amp; exit</Link>
            </Button>
            <Button
              onClick={onSubmit}
              disabled={submitting || !isAnswerComplete(currentQuestion, value)}
            >
              {submitting ? "Submitting…" : "Submit answer"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ResultCard({
  icon,
  title,
  body,
  backHref,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  backHref: string;
}) {
  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <div className="flex justify-center">{icon}</div>
      <h1 className="mt-4 text-xl font-semibold">{title}</h1>
      <p className="text-muted-foreground mt-2 text-sm">{body}</p>
      <Button asChild className="mt-6">
        <Link href={backHref}>Back to application</Link>
      </Button>
    </div>
  );
}
