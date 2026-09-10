import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TemplateEditView } from "@/components/templates/ats/edit/template-edit-view";
import {
  TEMPLATE_KINDS,
  TEMPLATE_KIND_LABELS,
  type TemplateKind,
} from "@/features/templates/schema";
import { FormSkeleton } from "@/components/page-skeleton";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ kind: string }>;
}): Promise<Metadata> {
  const { kind } = await params;
  const label = TEMPLATE_KIND_LABELS[kind as TemplateKind];
  return { title: label ? `Edit ${label.toLowerCase()} template` : "Edit template" };
}

export default async function TemplateEditPage({
  params,
}: {
  params: Promise<{ kind: string; id: string }>;
}) {
  const { kind, id } = await params;
  if (!TEMPLATE_KINDS.includes(kind as TemplateKind)) notFound();
  return (
    <Suspense fallback={<FormSkeleton />}>
      <TemplateEditView kind={kind as TemplateKind} id={id} />
    </Suspense>
  );
}
