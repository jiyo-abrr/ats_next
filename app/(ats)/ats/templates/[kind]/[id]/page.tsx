import { Suspense } from "react";
import { notFound } from "next/navigation";

import { TemplateDetailView } from "@/features/templates/ui/ats/template-detail-view";
import { TEMPLATE_KINDS, type TemplateKind } from "@/features/templates/schema";
import { DetailSkeleton } from "@/components/page-skeleton";

export default async function TemplateDetailPage({
  params,
}: {
  params: Promise<{ kind: string; id: string }>;
}) {
  const { kind, id } = await params;
  if (!TEMPLATE_KINDS.includes(kind as TemplateKind)) notFound();
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <TemplateDetailView kind={kind as TemplateKind} id={id} />
    </Suspense>
  );
}
