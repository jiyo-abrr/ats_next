"use client";

import { useEffect, useState } from "react";

import type { ComboOption } from "@/components/form/async-combobox";
import * as positionsService from "@/features/positions/positionsService";
import * as companyAddressesService from "@/features/company-addresses/companyAddressesService";
import * as tagsService from "@/features/tags/tagsService";
import type { Tag } from "@/features/tags/schema";
import { useTemplates } from "@/features/templates/hooks";
import type { TemplateKind } from "@/features/templates/schema";

const PAGE = "size=100&sort=title:asc";

/**
 * One-shot loads for the job-post Details form's FK pickers — fetched via the
 * services directly so they don't overwrite the ref-data slices' table `data`.
 */
export function useJobPostFormOptions() {
  const [positions, setPositions] = useState<ComboOption[]>([]);
  const [addresses, setAddresses] = useState<ComboOption[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const templates = useTemplates();

  useEffect(() => {
    positionsService
      .getAll(PAGE)
      .then((r) =>
        setPositions(r.items.map((p) => ({ value: p.id, label: p.title }))),
      )
      .catch(() => undefined);
    companyAddressesService
      .getAll("size=100&sort=label:asc")
      .then((r) =>
        setAddresses(
          r.items.map((a) => ({
            value: a.id,
            label: a.label,
            hint: [a.city, a.country].filter(Boolean).join(", "),
          })),
        ),
      )
      .catch(() => undefined);
    tagsService
      .getAll("size=100&sort=name:asc")
      .then((r) => setTags(r.items))
      .catch(() => undefined);
  }, []);

  const templateOptions = (kind: TemplateKind): ComboOption[] =>
    templates.byKind[kind].map((t) => ({
      value: t.id,
      label: t.title,
      hint: t.questions.length ? `${t.questions.length} q` : undefined,
    }));

  return { positions, addresses, tags, templateOptions, templates };
}
