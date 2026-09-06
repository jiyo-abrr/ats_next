"use client";

import { useState } from "react";

import { toast } from "@/lib/utils/toast";

/**
 * Sheet + editing state for a reference-data manager, plus save/delete
 * orchestration. The caller passes thunk-backed `save` / `remove` functions
 * (already `dispatch(...).unwrap()`-wrapped) and an `onChanged` refetch.
 */
export function useResourceCrud<TItem extends { id: string }>(opts: {
  singular: string;
  save: (body: Record<string, unknown>, editing: TItem | null) => Promise<unknown>;
  remove: (item: TItem) => Promise<unknown>;
  onChanged: () => void;
}) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<TItem | null>(null);
  const [busy, setBusy] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setSheetOpen(true);
  };
  const openEdit = (item: TItem) => {
    setEditing(item);
    setSheetOpen(true);
  };

  const submit = async (body: Record<string, unknown>) => {
    setBusy(true);
    try {
      await opts.save(body, editing);
      toast.success(`${opts.singular} ${editing ? "updated" : "created"}`);
      setSheetOpen(false);
      opts.onChanged();
      return true;
    } catch {
      return false; // toast raised by the toast-error middleware
    } finally {
      setBusy(false);
    }
  };

  const remove = async (item: TItem) => {
    try {
      await opts.remove(item);
      toast.success(`${opts.singular} deleted`);
      setSheetOpen(false);
      opts.onChanged();
    } catch {
      /* toast raised by middleware */
    }
  };

  return {
    sheetOpen,
    setSheetOpen,
    editing,
    busy,
    openCreate,
    openEdit,
    submit,
    remove,
  };
}
