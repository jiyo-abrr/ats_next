import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TemplateKindView } from "@/features/templates/ui/ats/template-kind-view";
import {
  TEMPLATE_KINDS,
  TEMPLATE_KIND_LABELS,
  type TemplateKind,
} from "@/features/templates/schema";
import { TableSkeleton } from "@/components/data-table/table-skeleton";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ kind: string }>;
}): Promise<Metadata> {
  const { kind } = await params;
  const label = TEMPLATE_KIND_LABELS[kind as TemplateKind];
  return { title: label ? `${label} templates` : "Assessment templates" };
}

export default async function TemplateKindPage({
  params,
}: {
  params: Promise<{ kind: string }>;
}) {
  const { kind } = await params;
  if (!TEMPLATE_KINDS.includes(kind as TemplateKind)) notFound();
  return (
    <Suspense fallback={<TableSkeleton />}>
      <TemplateKindView kind={kind as TemplateKind} />
    </Suspense>
  );
}
