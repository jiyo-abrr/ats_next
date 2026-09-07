"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { PageHeader } from "@/components/page-header";
import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux";
import { toast } from "@/lib/utils/toast";
import { createTemplate } from "@/lib/store/templatesSlice";
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

export function TemplateCreateView({ kind }: { kind: TemplateKind }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const saving = useAppSelector((s) => s.templates.saving);
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
      router.push(`/ats/templates/${kind}/${tpl.id}/edit`);
    } catch {
      /* toast-error middleware surfaces it */
    }
  });

  return (
    <div className="space-y-5">
      <Breadcrumbs
        items={[
          { label: `${label} templates`, href: `/ats/templates/${kind}` },
          { label: "New" },
        ]}
      />
      <Link
        href={`/ats/templates/${kind}`}
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="size-4" /> {label} templates
      </Link>

      <PageHeader
        title={`New ${label.toLowerCase()} template`}
        description="Name it and set the timing — you'll add questions next."
      />

      <Card>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-5">
            <TemplateForm form={form} />
            <div className="flex justify-end gap-2">
              <Button asChild type="button" variant="outline">
                <Link href={`/ats/templates/${kind}`}>Cancel</Link>
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Creating…" : "Create & add questions"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
