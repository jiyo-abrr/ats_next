"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { SelectField, TextareaField, TextField } from "@/components/form/fields";
import { QUESTION_TYPE_LABELS } from "@/lib/constants";
import { useAppDispatch } from "@/lib/hooks/redux";
import { toast } from "@/lib/utils/toast";
import {
  addTemplateQuestion,
  updateTemplateQuestion,
} from "@/lib/store/templatesSlice";
import {
  QUESTION_TYPES,
  type QuestionInput,
  type TemplateKind,
  type TemplateQuestion,
  buildQuestionConfig,
  questionFormBody,
  questionFormValues,
  questionSchema,
} from "@/features/templates/schema";

const typeOptions = QUESTION_TYPES.map((value) => ({
  value,
  label: QUESTION_TYPE_LABELS[value],
}));

/** Bare form (no card wrapper) — callers place it in a card / bordered row. */
export function QuestionForm({
  kind,
  templateId,
  question,
  nextOrderIndex,
  onDone,
  onCancel,
}: {
  kind: TemplateKind;
  templateId: string;
  /** Present ⇒ edit mode. Absent ⇒ append a new question. */
  question?: TemplateQuestion;
  /** Only used when appending. */
  nextOrderIndex?: number;
  onDone: () => void;
  /** Shown as a Cancel button when editing. */
  onCancel?: () => void;
}) {
  const dispatch = useAppDispatch();
  const editing = !!question;

  const form = useForm<QuestionInput>({
    resolver: zodResolver(questionSchema),
    defaultValues: questionFormValues(question),
  });
  // eslint-disable-next-line react-hooks/incompatible-library
  const qType = form.watch("question_type");

  const onSubmit = form.handleSubmit(async (v) => {
    const isChoiceType =
      v.question_type === "single_choice" ||
      v.question_type === "multiple_choice";
    if (isChoiceType && buildQuestionConfig(v)?.options === undefined) {
      form.setError("options", { message: "Add at least one option" });
      return;
    }
    try {
      if (editing) {
        await dispatch(
          updateTemplateQuestion({
            kind,
            id: templateId,
            questionId: question.id,
            body: questionFormBody(v),
          }),
        ).unwrap();
        toast.success("Question updated");
      } else {
        await dispatch(
          addTemplateQuestion({
            kind,
            id: templateId,
            body: questionFormBody(v, nextOrderIndex ?? 0),
          }),
        ).unwrap();
        toast.success("Question added");
        form.reset(questionFormValues());
      }
      onDone();
    } catch {
      /* toast-error middleware surfaces it */
    }
  });

  const isChoice = qType === "single_choice" || qType === "multiple_choice";
  const isMulti = qType === "multiple_choice";
  const isRange = qType === "number" || qType === "rating";
  const isText = qType === "text" || qType === "long_text";
  const isDate = qType === "date";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <FieldGroup>
        <SelectField
          control={form.control}
          name="question_type"
          label="Type"
          options={typeOptions}
          required
        />
        <TextareaField
          control={form.control}
          name="prompt"
          label="Prompt"
          rows={2}
          required
        />

        {isChoice ? (
          <TextareaField
            control={form.control}
            name="options"
            label="Options (one per line)"
            rows={4}
          />
        ) : null}

        {isMulti ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              control={form.control}
              name="min_selections"
              label="Min selections"
              type="number"
              description="Blank = no minimum"
            />
            <TextField
              control={form.control}
              name="max_selections"
              label="Max selections"
              type="number"
              description="Blank = no maximum"
            />
          </div>
        ) : null}

        {isRange ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              control={form.control}
              name="min"
              label="Min"
              type="number"
            />
            <TextField
              control={form.control}
              name="max"
              label="Max"
              type="number"
            />
          </div>
        ) : null}

        {isText ? (
          <TextField
            control={form.control}
            name="max_length"
            label="Max length (characters)"
            type="number"
            description="Blank = no limit"
          />
        ) : null}

        {isDate ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              control={form.control}
              name="min_date"
              label="Earliest allowed"
              type="date"
            />
            <TextField
              control={form.control}
              name="max_date"
              label="Latest allowed"
              type="date"
            />
          </div>
        ) : null}

        <TextField
          control={form.control}
          name="time_limit_seconds"
          label="Per-question time limit (seconds)"
          type="number"
          description="Blank = untimed. A question past its timer is skipped."
        />
      </FieldGroup>

      <div className="flex justify-end gap-2">
        {editing && onCancel ? (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={form.formState.isSubmitting}
          >
            Cancel
          </Button>
        ) : null}
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting
            ? "Saving…"
            : editing
              ? "Save question"
              : "Add question"}
        </Button>
      </div>
    </form>
  );
}
