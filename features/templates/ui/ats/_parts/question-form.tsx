"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import {
  SelectField,
  TextareaField,
  TextField,
} from "@/components/form/fields";
import { QUESTION_TYPE_LABELS } from "@/lib/constants";
import { useAppDispatch } from "@/lib/hooks/redux";
import { toast } from "@/lib/utils/toast";
import { addTemplateQuestion } from "@/lib/store/templatesSlice";
import {
  QUESTION_TYPES,
  type QuestionInput,
  type TemplateKind,
  buildQuestionConfig,
  questionSchema,
} from "@/features/templates/schema";

const typeOptions = QUESTION_TYPES.map((value) => ({
  value,
  label: QUESTION_TYPE_LABELS[value],
}));

export function QuestionForm({
  kind,
  templateId,
  nextOrderIndex,
  onAdded,
}: {
  kind: TemplateKind;
  templateId: string;
  nextOrderIndex: number;
  onAdded: () => void;
}) {
  const dispatch = useAppDispatch();

  const form = useForm<QuestionInput>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      prompt: "",
      instructions: "",
      question_type: "text",
      options: "",
      min: "",
      max: "",
      time_limit_seconds: "",
    },
  });
  // eslint-disable-next-line react-hooks/incompatible-library
  const qType = form.watch("question_type");

  const onSubmit = form.handleSubmit(async (v) => {
    if (
      (v.question_type === "single_choice" ||
        v.question_type === "multiple_choice") &&
      buildQuestionConfig(v)?.options === undefined
    ) {
      form.setError("options", { message: "Add at least one option" });
      return;
    }
    try {
      await dispatch(
        addTemplateQuestion({
          kind,
          id: templateId,
          body: {
            order_index: nextOrderIndex,
            prompt: v.prompt,
            instructions: v.instructions || null,
            question_type: v.question_type,
            config: buildQuestionConfig(v),
            time_limit_seconds: v.time_limit_seconds
              ? Number(v.time_limit_seconds)
              : null,
          },
        }),
      ).unwrap();
      toast.success("Question added");
      form.reset();
      onAdded();
    } catch {
      /* handled */
    }
  });

  const isChoice =
    qType === "single_choice" || qType === "multiple_choice";
  const isRange = qType === "number" || qType === "rating";

  return (
    <Card>
      <CardContent className="p-4">
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
            <TextField
              control={form.control}
              name="instructions"
              label="Instructions"
            />
            {isChoice ? (
              <TextareaField
                control={form.control}
                name="options"
                label="Options (one per line)"
                rows={4}
              />
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
            <TextField
              control={form.control}
              name="time_limit_seconds"
              label="Per-question time limit (seconds)"
              type="number"
            />
          </FieldGroup>
          <div className="flex justify-end">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Adding…" : "Add question"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
