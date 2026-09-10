import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TemplateCreateView } from "@/components/templates/ats/create/template-create-view";
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
  return {
    title: label ? `New ${label.toLowerCase()} template` : "New template",
  };
}

export default async function NewTemplatePage({
  params,
}: {
  params: Promise<{ kind: string }>;
}) {
  const { kind } = await params;
  if (!TEMPLATE_KINDS.includes(kind as TemplateKind)) notFound();
  return (
    <Suspense fallback={<FormSkeleton />}>
      <TemplateCreateView kind={kind as TemplateKind} />
    </Suspense>
  );
}
