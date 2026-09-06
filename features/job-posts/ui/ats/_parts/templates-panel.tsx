"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AsyncCombobox } from "@/components/form/async-combobox";
import { useAppDispatch } from "@/lib/hooks/redux";
import {
  removeJobPostTemplate,
  setJobPostTemplate,
} from "@/lib/store/jobPostsSlice";
import type { TemplateKind } from "@/features/templates/schema";
import type { JobPost } from "@/features/job-posts/schema";
import { useJobPostFormOptions } from "../use-form-options";

const KINDS: { kind: TemplateKind; label: string; field: keyof JobPost }[] = [
  {
    kind: "pre-assessment",
    label: "Pre-assessment",
    field: "pre_assessment_template_id",
  },
  {
    kind: "culture-fit",
    label: "Culture fit",
    field: "culture_fit_template_id",
  },
  {
    kind: "technical-assessment",
    label: "Technical",
    field: "technical_assessment_template_id",
  },
];

function Slot({
  job,
  kind,
  label,
  currentId,
}: {
  job: JobPost;
  kind: TemplateKind;
  label: string;
  currentId: string | null;
}) {
  const dispatch = useAppDispatch();
  const { templateOptions, templates } = useJobPostFormOptions();
  const [pick, setPick] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const options = templateOptions(kind);
  const current = templates.byKind[kind].find((t) => t.id === currentId);

  const attach = async () => {
    if (!pick) return;
    setBusy(true);
    await dispatch(
      setJobPostTemplate({ id: job.id, kind, templateId: pick }),
    )
      .unwrap()
      .catch(() => undefined);
    setPick(null);
    setBusy(false);
  };

  const detach = async () => {
    if (!currentId) return;
    setBusy(true);
    await dispatch(
      removeJobPostTemplate({ id: job.id, kind, templateId: currentId }),
    )
      .unwrap()
      .catch(() => undefined);
    setBusy(false);
  };

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <p className="text-sm font-medium">{label}</p>
        {current ? (
          <div className="flex items-center justify-between gap-3">
            <div className="text-muted-foreground text-sm">
              {current.title}
              <span className="ml-2 text-xs">
                {current.questions.length} question
                {current.questions.length === 1 ? "" : "s"}
                {current.time_limit_minutes
                  ? ` · ${current.time_limit_minutes} min`
                  : ""}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={detach}
              disabled={busy}
            >
              Remove
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <AsyncCombobox
              options={options}
              value={pick}
              onChange={setPick}
              placeholder={`Attach a ${label.toLowerCase()} template…`}
            />
            <Button onClick={attach} disabled={!pick || busy}>
              Attach
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function TemplatesPanel({ job }: { job: JobPost }) {
  return (
    <div className="space-y-3">
      <p className="text-muted-foreground text-sm">
        Applicants complete the attached assessments before prescreening review
        (0–3, none mandatory).
      </p>
      {KINDS.map(({ kind, label, field }) => (
        <Slot
          key={kind}
          job={job}
          kind={kind}
          label={label}
          currentId={job[field] as string | null}
        />
      ))}
    </div>
  );
}
