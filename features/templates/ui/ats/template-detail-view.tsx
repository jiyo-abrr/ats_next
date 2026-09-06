"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ErrorState } from "@/components/states";
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

export function TemplateDetailView({
  kind,
  id,
}: {
  kind: TemplateKind;
  id: string;
}) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { template, loading, saving, refetch } = useTemplate(kind, id);

  const form = useForm<TemplateInput>({
    resolver: zodResolver(templateSchema),
    values: templateFormValues(template),
  });

  if (!loading && !template) {
    return (
      <div className="max-w-3xl">
        <ErrorState message="This template could not be loaded." onRetry={refetch} />
      </div>
    );
  }
  if (loading || !template) {
    return (
      <div className="max-w-3xl space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-64 w-full" />
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

  const nextOrder =
    (template.questions.reduce((m, q) => Math.max(m, q.order_index), 0) || 0) + 1;

  return (
    <div className="max-w-3xl space-y-6">
      <Breadcrumbs
        items={[
          { label: "Assessment templates", href: "/ats/templates" },
          { label: `${TEMPLATE_KIND_LABELS[kind]} · ${template.title}` },
        ]}
      />
      <Link
        href="/ats/templates"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="size-4" /> Templates
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">
          {template.title}
        </h1>
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
              router.push("/ats/templates");
            } catch {
              /* handled */
            }
          }}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
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

      <div className="space-y-3">
        <h2 className="text-sm font-semibold">
          Questions ({template.questions.length})
        </h2>
        <QuestionsList questions={template.questions} />
        <QuestionForm
          kind={kind}
          templateId={id}
          nextOrderIndex={nextOrder}
          onAdded={refetch}
        />
      </div>
    </div>
  );
}
