"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/pagination";
import { DataTableToolbar } from "@/components/data-table/toolbar";
import { EntityFormSheet } from "@/components/form/entity-form-sheet";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useAppDispatch } from "@/lib/hooks/redux";
import { useResourceCrud } from "@/lib/hooks/use-resource-crud";
import { type Position, type PositionInput, positionSchema } from "@/features/positions/schema";
import {
  createPosition,
  deletePosition,
  updatePosition,
} from "@/lib/store/positionsSlice";
import { usePositions } from "@/features/positions/hooks";
import { positionsColumns } from "./positions-columns";
import { PositionForm } from "./position-form";

export function PositionsView() {
  const dispatch = useAppDispatch();
  const {
    data,
    total,
    pages,
    loading,
    error,
    saving,
    query,
    setPage,
    setSize,
    setSearch,
    toggleSort,
    refetch,
  } = usePositions();

  const crud = useResourceCrud<Position>({
    singular: "Position",
    save: (body, editing) =>
      editing
        ? dispatch(updatePosition({ id: editing.id, body })).unwrap()
        : dispatch(createPosition(body)).unwrap(),
    remove: (item) => dispatch(deletePosition(item.id)).unwrap(),
    onChanged: refetch,
  });

  const form = useForm<PositionInput>({
    resolver: zodResolver(positionSchema),
    values: crud.editing
      ? {
          title: crud.editing.title,
          description: crud.editing.description ?? "",
        }
      : { title: "", description: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const ok = await crud.submit({
      title: values.title,
      description: values.description || null,
    });
    if (ok) form.reset();
  });

  return (
    <div>
      <PageHeader
        title="Positions"
        description="Reusable role definitions attached to job posts."
        actions={
          <Button onClick={crud.openCreate}>
            <Plus /> New position
          </Button>
        }
      />

      <DataTableToolbar
        search={query.search}
        onSearchChange={setSearch}
        searchPlaceholder="Search positions…"
      />

      <DataTable
        columns={positionsColumns(crud.openEdit)}
        data={data}
        isLoading={loading && data.length === 0}
        isError={!!error}
        onRetry={refetch}
        sort={query.sort}
        onToggleSort={toggleSort}
        emptyMessage="No positions yet."
      />

      <DataTablePagination
        page={query.page}
        size={query.size}
        total={total}
        pages={pages}
        onPageChange={setPage}
        onSizeChange={setSize}
        isLoading={loading}
      />

      <EntityFormSheet
        open={crud.sheetOpen}
        onOpenChange={crud.setSheetOpen}
        title={crud.editing ? "Edit position" : "New position"}
        onSubmit={onSubmit}
        isSubmitting={saving || crud.busy}
      >
        <PositionForm form={form} />
        {crud.editing ? (
          <ConfirmDialog
            trigger={
              <Button type="button" variant="destructive" size="sm">
                <Trash2 /> Delete position
              </Button>
            }
            title="Delete this position?"
            description="Job posts using it will block the delete."
            destructive
            confirmLabel="Delete"
            onConfirm={() => crud.remove(crud.editing!)}
          />
        ) : null}
      </EntityFormSheet>
    </div>
  );
}
