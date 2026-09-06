"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/page-header";
import { EntityFormSheet } from "@/components/form/entity-form-sheet";
import { EmptyState, ErrorState } from "@/components/states";
import { useAppDispatch } from "@/lib/hooks/redux";
import { toast } from "@/lib/utils/toast";
import { createTemplate } from "@/lib/store/templatesSlice";
import { useTemplatesByKind } from "@/features/templates/hooks";
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

export function TemplateKindView({ kind }: { kind: TemplateKind }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { items, loading, error, saving, refetch } = useTemplatesByKind(kind);
  const [sheetOpen, setSheetOpen] = useState(false);

  const label = TEMPLATE_KIND_LABELS[kind];

  const form = useForm<TemplateInput>({
    resolver: zodResolver(templateSchema),
    defaultValues: templateFormValues(),
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const tpl = await dispatch(
        createTemplate({ kind, body: templateFormBody(values) }),
      ).unwrap();
      toast.success("Template created");
      setSheetOpen(false);
      form.reset(templateFormValues());
      refetch();
      router.push(`/ats/templates/${kind}/${tpl.id}`);
    } catch {
      /* handled */
    }
  });

  return (
    <div className="space-y-4">
      <PageHeader
        title={`${label} templates`}
        description="Author the tests applicants complete before prescreening."
        actions={
          <Button
            size="sm"
            onClick={() => {
              form.reset(templateFormValues());
              setSheetOpen(true);
            }}
          >
            <Plus /> New {label.toLowerCase()} template
          </Button>
        }
      />

      {error ? (
        <ErrorState message="Couldn't load templates." onRetry={refetch} />
      ) : loading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title={`No ${label.toLowerCase()} templates yet`}
          className="py-10"
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((t) => (
            <Card key={t.id} className="hover:border-foreground/20">
              <Link href={`/ats/templates/${kind}/${t.id}`}>
                <CardContent className="space-y-1 p-4">
                  <p className="font-medium">{t.title}</p>
                  <p className="text-muted-foreground text-xs">
                    {t.questions.length} question
                    {t.questions.length === 1 ? "" : "s"}
                    {t.time_limit_minutes
                      ? ` · ${t.time_limit_minutes} min`
                      : ""}
                  </p>
                  {t.description ? (
                    <p className="text-muted-foreground line-clamp-2 text-sm">
                      {t.description}
                    </p>
                  ) : null}
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      )}

      <EntityFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title={`New ${label.toLowerCase()} template`}
        onSubmit={onSubmit}
        isSubmitting={saving}
        submitLabel="Create"
      >
        <TemplateForm form={form} />
      </EntityFormSheet>
    </div>
  );
}
