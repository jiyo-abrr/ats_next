"use client";

import { useState } from "react";
import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AsyncCombobox } from "@/components/form/async-combobox";
import { EmptyState } from "@/components/states";
import { useAppDispatch } from "@/lib/hooks/redux";
import { addJobPostTag, removeJobPostTag } from "@/lib/store/jobPostsSlice";
import type { JobPost } from "@/features/job-posts/schema";
import { useJobPostFormOptions } from "../../shared/form/use-form-options";

export function TagsPanel({ job }: { job: JobPost }) {
  const dispatch = useAppDispatch();
  const { tags: allTags } = useJobPostFormOptions();
  const [pick, setPick] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const attachedIds = new Set(job.tags.map((t) => t.id));
  const available = allTags
    .filter((t) => !attachedIds.has(t.id))
    .map((t) => ({ value: t.id, label: t.name }));

  const add = async () => {
    if (!pick) return;
    setBusy(true);
    await dispatch(addJobPostTag({ id: job.id, tagId: pick }))
      .unwrap()
      .catch(() => undefined);
    setPick(null);
    setBusy(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <AsyncCombobox
          options={available}
          value={pick}
          onChange={setPick}
          placeholder="Add a tag…"
          searchPlaceholder="Search tags…"
        />
        <Button onClick={add} disabled={!pick || busy}>
          Add
        </Button>
      </div>

      {job.tags.length === 0 ? (
        <EmptyState title="No tags attached" className="py-10" />
      ) : (
        <div className="flex flex-wrap gap-2">
          {job.tags.map((t) => (
            <Badge key={t.id} variant="secondary" className="gap-1 py-1 pr-1">
              {t.name}
              <button
                type="button"
                className="hover:bg-foreground/10 rounded p-0.5"
                onClick={() =>
                  dispatch(removeJobPostTag({ id: job.id, tagId: t.id }))
                }
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
