"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Clock, ListChecks, Plus, Timer, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ErrorState } from "@/components/states";
import { StatCard } from "@/components/stat-card";
import { useAppDispatch } from "@/lib/hooks/redux";
import { toast } from "@/lib/utils/toast";
import { deleteTemplate, updateTemplate } from "@/lib/store/templatesSlice";
import { useTemplate } from "@/features/templates/hooks";
import {
  TEMPLATE_KIND_LABELS,
  type TemplateInput,
  type TemplateKind,
  templateSchema,
} from "@/features/templates/schema";
import {
  TemplateForm,
  templateFormBody,
  templateFormValues,
} from "./template-form";
import { QuestionForm } from "./_parts/question-form";
import { QuestionsList } from "./_parts/questions-list";

export function TemplateEditView({
  kind,
  id,
}: {
  kind: TemplateKind;
  id: string;
}) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { template, loading, saving, refetch } = useTemplate(kind, id);
  const label = TEMPLATE_KIND_LABELS[kind];
  const viewHref = `/ats/templates/${kind}/${id}`;

  const form = useForm<TemplateInput>({
    resolver: zodResolver(templateSchema),
    values: templateFormValues(template),
  });

  if (!loading && !template) {
    return (
      <ErrorState
        message="This template could not be loaded."
        onRetry={refetch}
      />
    );
  }
  if (loading || !template) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-80 lg:col-span-2" />
          <Skeleton className="h-80" />
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  const onSave = form.handleSubmit(async (values) => {
    try {
      await dispatch(
        updateTemplate({ kind, id, body: templateFormBody(values) }),
      ).unwrap();
      toast.success("Template saved");
      form.reset(values);
    } catch {
      /* handled */
    }
  });

  const questions = template.questions;
  const timed = questions.filter((q) => q.time_limit_seconds).length;
  const nextOrder =
    (questions.reduce((m, q) => Math.max(m, q.order_index), 0) || 0) + 1;

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: `${label} templates`, href: `/ats/templates/${kind}` },
          { label: template.title, href: viewHref },
          { label: "Edit" },
        ]}
      />
      <Link
        href={viewHref}
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="size-4" /> Back to template
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">
          {template.title}
        </h1>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={viewHref}>Done</Link>
          </Button>
          <ConfirmDialog
            trigger={
              <Button variant="destructive" size="sm">
                <Trash2 /> Delete
              </Button>
            }
            title="Delete this template?"
            description="Job posts referencing it will block the delete."
            destructive
            confirmLabel="Delete"
            onConfirm={async () => {
              try {
                await dispatch(deleteTemplate({ kind, id })).unwrap();
                toast.success("Template deleted");
                router.push(`/ats/templates/${kind}`);
              } catch {
                /* handled */
              }
            }}
          />
        </div>
      </div>

      {/* Details form (left) + metrics (right) */}
      <div className="grid items-start gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Details</CardTitle>
            <CardDescription>
              Title, description, applicant instructions and the whole-attempt
              timer.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSave} className="space-y-5">
              <TemplateForm form={form} />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={saving || !form.formState.isDirty}
                >
                  {saving ? "Saving…" : "Save details"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
          <StatCard
            label="Questions"
            value={questions.length}
            icon={ListChecks}
          />
          <StatCard
            label="Attempt timer"
            value={template.time_limit_minutes ?? "—"}
            hint={template.time_limit_minutes ? "minutes" : "no overall limit"}
            icon={Clock}
          />
          <StatCard
            label="Timed questions"
            value={timed}
            hint="with a per-question clock"
            icon={Timer}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-1.5">
            <ListChecks className="text-muted-foreground size-4" />
            Questions ({questions.length})
          </CardTitle>
          <CardDescription>
            Reorder with the arrows, edit with the pencil. Applicants answer in
            this order, one at a time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <QuestionsList kind={kind} templateId={id} questions={questions} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-1.5">
            <Plus className="text-muted-foreground size-4" />
            Add a question
          </CardTitle>
        </CardHeader>
        <CardContent>
          <QuestionForm
            kind={kind}
            templateId={id}
            nextOrderIndex={nextOrder}
            onDone={refetch}
          />
        </CardContent>
      </Card>
    </div>
  );
}
