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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/page-header";
import { EntityFormSheet } from "@/components/form/entity-form-sheet";
import { EmptyState, ErrorState } from "@/components/states";
import { useAppDispatch } from "@/lib/hooks/redux";
import { toast } from "@/lib/utils/toast";
import { createTemplate } from "@/lib/store/templatesSlice";
import { useTemplates } from "@/features/templates/hooks";
import {
  TEMPLATE_KINDS,
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

export function TemplatesView() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { byKind, loading, error, saving, refetch } = useTemplates();
  const [sheetKind, setSheetKind] = useState<TemplateKind | null>(null);

  const form = useForm<TemplateInput>({
    resolver: zodResolver(templateSchema),
    defaultValues: templateFormValues(),
  });

  const onSubmit = form.handleSubmit(async (values) => {
    if (!sheetKind) return;
    try {
      const tpl = await dispatch(
        createTemplate({ kind: sheetKind, body: templateFormBody(values) }),
      ).unwrap();
      toast.success("Template created");
      setSheetKind(null);
      form.reset(templateFormValues());
      refetch();
      router.push(`/ats/templates/${sheetKind}/${tpl.id}`);
    } catch {
      /* handled */
    }
  });

  return (
    <div>
      <PageHeader
        title="Assessment templates"
        description="Author the tests applicants complete before prescreening."
      />

      {error ? (
        <ErrorState message="Couldn't load templates." onRetry={refetch} />
      ) : (
        <Tabs defaultValue={TEMPLATE_KINDS[0]}>
          <TabsList>
            {TEMPLATE_KINDS.map((k) => (
              <TabsTrigger key={k} value={k}>
                {TEMPLATE_KIND_LABELS[k]} ({byKind[k].length})
              </TabsTrigger>
            ))}
          </TabsList>

          {TEMPLATE_KINDS.map((kind) => (
            <TabsContent key={kind} value={kind} className="space-y-3 pt-4">
              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={() => {
                    form.reset(templateFormValues());
                    setSheetKind(kind);
                  }}
                >
                  <Plus /> New {TEMPLATE_KIND_LABELS[kind].toLowerCase()} template
                </Button>
              </div>

              {loading && byKind[kind].length === 0 ? (
                <Skeleton className="h-24 w-full" />
              ) : byKind[kind].length === 0 ? (
                <EmptyState title="No templates yet" className="py-10" />
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {byKind[kind].map((t) => (
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
            </TabsContent>
          ))}
        </Tabs>
      )}

      <EntityFormSheet
        open={sheetKind !== null}
        onOpenChange={(o) => !o && setSheetKind(null)}
        title={
          sheetKind
            ? `New ${TEMPLATE_KIND_LABELS[sheetKind].toLowerCase()} template`
            : ""
        }
        onSubmit={onSubmit}
        isSubmitting={saving}
        submitLabel="Create"
      >
        <TemplateForm form={form} />
      </EntityFormSheet>
    </div>
  );
}
