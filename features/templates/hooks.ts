"use client";

import { useCallback, useEffect } from "react";

import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux";
import { fetchTemplate, fetchTemplates } from "@/lib/store/templatesSlice";
import type { TemplateKind } from "@/features/templates/schema";

/** All three kinds — job-post pickers + the templates index page. */
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
