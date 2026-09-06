"use client";

import { useCallback, useEffect } from "react";

import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux";
import { useTableQuery } from "@/lib/hooks/use-table-query";
import {
  fetchTemplate,
  fetchTemplates,
  fetchTemplatesByKind,
} from "@/lib/store/templatesSlice";
import type { TemplateKind } from "@/features/templates/schema";

/** All three kinds at once — only the job-post form's template pickers need this. */
export function useTemplates() {
  const dispatch = useAppDispatch();
  const state = useAppSelector((s) => s.templates);

  useEffect(() => {
    dispatch(fetchTemplates());
  }, [dispatch]);

  const refetch = useCallback(() => {
    dispatch(fetchTemplates());
  }, [dispatch]);

  return { ...state, refetch };
}

/** One kind, paginated — the per-kind templates page (`/ats/templates/<kind>`). */
export function useTemplatesByKind(kind: TemplateKind) {
  const dispatch = useAppDispatch();
  const table = useTableQuery();
  const qs = new URLSearchParams({
    page: String(table.query.page),
    size: String(table.query.size),
  }).toString();

  const { list, listKind, listTotal, listPages, loading, error, saving } =
    useAppSelector((s) => s.templates);

  useEffect(() => {
    dispatch(fetchTemplatesByKind({ kind, qs }));
  }, [dispatch, kind, qs]);

  const refetch = useCallback(() => {
    dispatch(fetchTemplatesByKind({ kind, qs }));
  }, [dispatch, kind, qs]);

  const items = listKind === kind ? list : [];

  return {
    ...table,
    items,
    total: listTotal,
    pages: listPages,
    loading: loading && items.length === 0,
    error,
    saving,
    refetch,
  };
}

export function useTemplate(kind: TemplateKind, id: string) {
  const dispatch = useAppDispatch();
  const template = useAppSelector((s) => s.templates.byId[id]);
  const detailLoading = useAppSelector((s) => s.templates.detailLoading);
  const saving = useAppSelector((s) => s.templates.saving);

  useEffect(() => {
    if (id) dispatch(fetchTemplate({ kind, id }));
  }, [dispatch, kind, id]);

  const refetch = useCallback(() => {
    if (id) dispatch(fetchTemplate({ kind, id }));
  }, [dispatch, kind, id]);

  return { template, loading: detailLoading && !template, saving, refetch };
}
