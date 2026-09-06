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
import { type Tag, type TagInput, tagSchema } from "@/features/tags/schema";
import {
  createTag,
  deleteTag,
  updateTag,
} from "@/lib/store/tagsSlice";
import { useTags } from "@/features/tags/hooks";
import { tagsColumns } from "./tags-columns";
import { TagForm } from "./tag-form";

export function TagsView() {
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
  } = useTags();

  const crud = useResourceCrud<Tag>({
    singular: "Tag",
    save: (body, editing) =>
      editing
        ? dispatch(updateTag({ id: editing.id, body })).unwrap()
        : dispatch(createTag(body)).unwrap(),
    remove: (item) => dispatch(deleteTag(item.id)).unwrap(),
    onChanged: refetch,
  });

  const form = useForm<TagInput>({
    resolver: zodResolver(tagSchema),
    values: crud.editing
      ? {
          name: crud.editing.name,
          description: crud.editing.description ?? "",
        }
      : { name: "", description: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const ok = await crud.submit({
      name: values.name,
      description: values.description || null,
    });
    if (ok) form.reset();
  });

  return (
    <div>
      <PageHeader
        title="Tags"
        description="Labels for categorizing job posts."
        actions={
          <Button onClick={crud.openCreate}>
            <Plus /> New tag
          </Button>
        }
      />

      <DataTableToolbar
        search={query.search}
        onSearchChange={setSearch}
        searchPlaceholder="Search tags…"
      />

      <DataTable
        columns={tagsColumns(crud.openEdit)}
        data={data}
        isLoading={loading && data.length === 0}
        isError={!!error}
        onRetry={refetch}
        sort={query.sort}
        onToggleSort={toggleSort}
        emptyMessage="No tags yet."
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
        title={crud.editing ? "Edit tag" : "New tag"}
        onSubmit={onSubmit}
        isSubmitting={saving || crud.busy}
      >
        <TagForm form={form} />
        {crud.editing ? (
          <ConfirmDialog
            trigger={
              <Button type="button" variant="destructive" size="sm">
                <Trash2 /> Delete tag
              </Button>
            }
            title="Delete this tag?"
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
