import { Suspense } from "react";
import { notFound } from "next/navigation";

import { TemplateView } from "@/components/templates/ats/detail/template-view";
import { TEMPLATE_KINDS, type TemplateKind } from "@/features/templates/schema";
import { DetailSkeleton } from "@/components/page-skeleton";

export default async function TemplateViewPage({
  params,
}: {
  params: Promise<{ kind: string; id: string }>;
}) {
  const { kind, id } = await params;
  if (!TEMPLATE_KINDS.includes(kind as TemplateKind)) notFound();
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <TemplateView kind={kind as TemplateKind} id={id} />
    </Suspense>
  );
}
