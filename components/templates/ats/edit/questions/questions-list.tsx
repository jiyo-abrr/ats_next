"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/states";
import { QUESTION_TYPE_LABELS } from "@/lib/constants";
import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux";
import { toast } from "@/lib/utils/toast";
import {
  deleteTemplateQuestion,
  reorderTemplateQuestions,
} from "@/lib/store/templatesSlice";
import {
  type TemplateKind,
  type TemplateQuestion,
  questionConfigSummary,
} from "@/features/templates/schema";
import { QuestionForm } from "./question-form";

export function QuestionsList({
  kind,
  templateId,
  questions,
}: {
  kind: TemplateKind;
  templateId: string;
  questions: TemplateQuestion[];
}) {
  const dispatch = useAppDispatch();
  const saving = useAppSelector((s) => s.templates.saving);
  const [editingId, setEditingId] = useState<string | null>(null);

  const sorted = [...questions].sort((a, b) => a.order_index - b.order_index);

  if (sorted.length === 0) {
    return (
      <EmptyState
        title="No questions yet"
        description="Add the first question below — applicants answer them in order."
        className="py-10"
      />
    );
  }

  const move = async (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= sorted.length) return;
    const ids = sorted.map((q) => q.id);
    [ids[index], ids[target]] = [ids[target], ids[index]];
    try {
      await dispatch(
        reorderTemplateQuestions({ kind, id: templateId, questionIds: ids }),
      ).unwrap();
    } catch {
      /* handled */
    }
  };

  return (
    <ol className="space-y-2">
      {sorted.map((q, i) => {
        if (editingId === q.id) {
          return (
            <li
              key={q.id}
              className="bg-muted/30 rounded-lg border border-dashed p-3"
            >
              <p className="text-muted-foreground mb-3 text-xs font-medium">
                Editing question {i + 1}
              </p>
              <QuestionForm
                kind={kind}
                templateId={templateId}
                question={q}
                onDone={() => setEditingId(null)}
                onCancel={() => setEditingId(null)}
              />
            </li>
          );
        }
        const summary = questionConfigSummary(q);
        return (
          <li key={q.id} className="rounded-lg border p-3">
            <div className="flex items-start gap-3">
              <span className="text-muted-foreground w-5 shrink-0 pt-0.5 text-right text-sm tabular-nums">
                {i + 1}.
              </span>
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-sm font-medium">{q.prompt}</p>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant="secondary" className="font-normal">
                    {QUESTION_TYPE_LABELS[q.question_type]}
                  </Badge>
                  {q.time_limit_seconds ? (
                    <Badge variant="outline" className="font-normal">
                      {q.time_limit_seconds}s
                    </Badge>
                  ) : null}
                </div>
                {summary.map((s, j) => (
                  <p key={j} className="text-muted-foreground text-xs">
                    {s}
                  </p>
                ))}
              </div>
              <div className="flex shrink-0 items-center gap-0.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  disabled={saving || i === 0}
                  onClick={() => move(i, -1)}
                  aria-label="Move question up"
                >
                  <ChevronUp className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  disabled={saving || i === sorted.length - 1}
                  onClick={() => move(i, 1)}
                  aria-label="Move question down"
                >
                  <ChevronDown className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={() => setEditingId(q.id)}
                  aria-label="Edit question"
                >
                  <Pencil className="size-4" />
                </Button>
                <ConfirmDialog
                  trigger={
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive size-7"
                      aria-label="Delete question"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  }
                  title="Delete this question?"
                  description="It's removed from the template. Answers applicants already submitted are kept."
                  destructive
                  confirmLabel="Delete"
                  onConfirm={async () => {
                    try {
                      await dispatch(
                        deleteTemplateQuestion({
                          kind,
                          id: templateId,
                          questionId: q.id,
                        }),
                      ).unwrap();
                      toast.success("Question deleted");
                    } catch {
                      /* handled */
                    }
                  }}
                />
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
