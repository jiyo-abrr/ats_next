"use client";

import { Button } from "@/components/ui/button";
import * as applicationsService from "@/features/applications/applicationsService";
import { parseEvaluationCsv } from "@/features/applications/evaluation-csv";
import { errorMessage } from "@/lib/api/client";
import { toast } from "@/lib/utils/toast";
import { Upload } from "lucide-react";
import { useState } from "react";

export function ImportResultsButton({
  jobId,
  onImported,
}: {
  jobId: string;
  onImported: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const pick = () => {
    const el = document.createElement("input");
    el.type = "file";
    el.accept = ".csv,text/csv,application/json,.json";
    el.onchange = async () => {
      const file = el.files?.[0];
      if (!file) return;
      setBusy(true);
      try {
        const text = await file.text();
        const isCsv =
          file.name.toLowerCase().endsWith(".csv") ||
          (!file.name.toLowerCase().endsWith(".json") &&
            !text.trimStart().startsWith("{"));
        const payload = isCsv
          ? parseEvaluationCsv(text, jobId)
          : (() => {
              const p = JSON.parse(text);
              if (p && typeof p === "object" && !p.job_post_id)
                p.job_post_id = jobId;
              return p;
            })();
        const res = await applicationsService.importEvaluations(payload);
        toast.success(
          `Imported ${res.imported} evaluation${res.imported === 1 ? "" : "s"}` +
            (res.skipped.length ? ` · ${res.skipped.length} skipped` : ""),
        );
        onImported();
      } catch (e) {
        toast.error(
          e instanceof SyntaxError
            ? "That file isn't valid JSON"
            : errorMessage(e),
        );
      } finally {
        setBusy(false);
      }
    };
    el.click();
  };
  return (
    <Button variant="outline" size="sm" onClick={pick} disabled={busy}>
      <Upload className="size-4" />
      {busy ? "Importing…" : "Import evaluation results"}
    </Button>
  );
}
