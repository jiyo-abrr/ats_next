"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AsyncCombobox } from "@/components/form/async-combobox";
import { EmptyState } from "@/components/states";
import { useAppDispatch } from "@/lib/hooks/redux";
import {
  addJobPostExclusion,
  removeJobPostExclusion,
} from "@/lib/store/jobPostsSlice";
import * as jobPostsService from "@/features/job-posts/jobPostsService";
import type { JobPost } from "@/features/job-posts/schema";

export function ExclusionsPanel({ job }: { job: JobPost }) {
  const dispatch = useAppDispatch();
  const [others, setOthers] = useState<{ id: string; job_title: string }[]>([]);
  const [pick, setPick] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    jobPostsService
      .getAll("size=200&sort=job_title:asc")
      .then((r) => setOthers(r.items.filter((j) => j.id !== job.id)))
      .catch(() => undefined);
  }, [job.id]);

  const titleOf = (id: string) =>
    others.find((j) => j.id === id)?.job_title ?? id.slice(0, 8);

  const excludedSet = new Set(job.excluded_job_post_ids);
  const available = others
    .filter((j) => !excludedSet.has(j.id))
    .map((j) => ({ value: j.id, label: j.job_title }));

  const add = async () => {
    if (!pick) return;
    setBusy(true);
    await dispatch(addJobPostExclusion({ id: job.id, excludedId: pick }))
      .unwrap()
      .catch(() => undefined);
    setPick(null);
    setBusy(false);
  };

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">
        Applicants who applied to an excluded job post can&apos;t apply to this one.
      </p>
      <div className="flex gap-2">
        <AsyncCombobox
          options={available}
          value={pick}
          onChange={setPick}
          placeholder="Exclude a job post…"
          searchPlaceholder="Search job posts…"
        />
        <Button onClick={add} disabled={!pick || busy}>
          Add
        </Button>
      </div>

      {job.excluded_job_post_ids.length === 0 ? (
        <EmptyState title="No exclusions" className="py-10" />
      ) : (
        <div className="flex flex-wrap gap-2">
          {job.excluded_job_post_ids.map((exId) => (
            <Badge key={exId} variant="secondary" className="gap-1 py-1 pr-1">
              {titleOf(exId)}
              <button
                type="button"
                className="hover:bg-foreground/10 rounded p-0.5"
                onClick={() =>
                  dispatch(
                    removeJobPostExclusion({ id: job.id, excludedId: exId }),
                  )
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
