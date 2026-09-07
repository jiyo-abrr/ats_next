"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/page-header";
import { DataTablePagination } from "@/components/data-table/pagination";
import { EmptyState, ErrorState } from "@/components/states";
import { useTemplatesByKind } from "@/features/templates/hooks";
import {
  TEMPLATE_KIND_LABELS,
  type TemplateKind,
} from "@/features/templates/schema";

export function TemplateKindView({ kind }: { kind: TemplateKind }) {
  const { items, total, pages, loading, error, query, setPage, setSize, refetch } =
    useTemplatesByKind(kind);

  const label = TEMPLATE_KIND_LABELS[kind];

  return (
    <div className="space-y-4">
      <PageHeader
        title={`${label} templates`}
        description="Author the tests applicants complete before prescreening."
        actions={
          <Button asChild size="sm">
            <Link href={`/ats/templates/${kind}/new`}>
              <Plus /> New {label.toLowerCase()} template
            </Link>
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
          action={
            <Button asChild size="sm">
              <Link href={`/ats/templates/${kind}/new`}>
                <Plus /> New template
              </Link>
            </Button>
          }
        />
      ) : (
        <>
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
          <DataTablePagination
            page={query.page}
            size={query.size}
            total={total}
            pages={pages}
            onPageChange={setPage}
            onSizeChange={setSize}
            isLoading={loading}
          />
        </>
      )}
    </div>
  );
}
