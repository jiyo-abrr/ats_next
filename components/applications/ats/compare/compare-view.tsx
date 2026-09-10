"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import * as applicationsService from "@/features/applications/applicationsService";
import { TEMPLATE_TYPE_LABELS } from "@/lib/constants";
import { FileArchive, FileSpreadsheet } from "lucide-react";
import { useState } from "react";
import { AssessmentAnswersTable } from "./assessment-answers/assessment-answers-table";
import { EvaluationCompareTable } from "./evaluation/evaluation-compare-table";
import { DownloadButton } from "./import-export/download-button";
import { ImportResultsButton } from "./import-export/import-results-button";
import { ScorecardTable } from "./scorecard/scorecard-table";
import { TEMPLATE_ORDER } from "./shared/constants";

export function CompareView({ jobId }: { jobId: string }) {
  const [scorecardKey, setScorecardKey] = useState(0);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-muted-foreground text-sm">
          Review résumés & assessments here. Or: export the pack → run it through
          ChatGPT (paste PROMPT.md) → import the filled evaluation-results.csv.
        </p>
        <div className="flex flex-wrap gap-2">
          <DownloadButton
            icon={FileArchive}
            label="Export evaluation pack"
            busyLabel="Preparing…"
            fetcher={() => applicationsService.exportEvaluationPack(jobId)}
            filename="evaluation-pack.zip"
          />
          <ImportResultsButton
            jobId={jobId}
            onImported={() => setScorecardKey((k) => k + 1)}
          />
          <DownloadButton
            icon={FileSpreadsheet}
            label="Export CSV"
            busyLabel="Exporting…"
            fetcher={() => applicationsService.exportEvaluationsCsv(jobId)}
            filename="evaluations.csv"
          />
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="ai-evaluation">AI evaluation</TabsTrigger>
          {TEMPLATE_ORDER.map((t) => (
            <TabsTrigger key={t} value={t}>
              {TEMPLATE_TYPE_LABELS[t]}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="pt-3">
          <p className="text-muted-foreground mb-3 text-sm">
            Every applicant’s résumé and assessment progress. Open a row for the
            full review.
          </p>
          <ScorecardTable key={scorecardKey} jobId={jobId} />
        </TabsContent>

        <TabsContent value="ai-evaluation" className="pt-3">
          <p className="text-muted-foreground mb-3 text-sm">
            The imported AI evaluation, dimension by dimension, side by side.
            Hover a rating to see the reason.
          </p>
          <EvaluationCompareTable key={scorecardKey} jobId={jobId} />
        </TabsContent>

        {TEMPLATE_ORDER.map((t) => (
          <TabsContent key={t} value={t} className="pt-3">
            <p className="text-muted-foreground mb-3 text-sm">
              Every applicant’s answers to the {TEMPLATE_TYPE_LABELS[t]}{" "}
              assessment, side by side.
            </p>
            <div className="overflow-x-auto">
              <AssessmentAnswersTable jobId={jobId} templateType={t} />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
