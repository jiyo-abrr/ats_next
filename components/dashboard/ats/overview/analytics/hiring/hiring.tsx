"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalyticsOverview } from "@/features/analytics/schema";
import { ArrowUpRight, Clock3 } from "lucide-react";
import Link from "next/link";
import { ActivityBars, MetricGrid, StatusBars, number, percent } from "../primitives";

export function Hiring({ data }: { data: AnalyticsOverview }) {
  const hiring = data.hiring;
  return (
    <div className="grid items-start gap-3 xl:grid-cols-12">
      <MetricGrid
        className="xl:col-span-12"
        metrics={[
          [
            "Applications",
            number(hiring.total_applications),
            "received in this period",
          ],
          [
            "Unique applicants",
            number(hiring.unique_applicants),
            "distinct people",
          ],
          [
            "Active candidates",
            number(hiring.active_candidates),
            "in active stages",
          ],
          [
            "Hire conversion",
            percent(hiring.hire_conversion_rate),
            `${number(hiring.hires)} hires`,
          ],
        ]}
      />
      <Card size="sm" className="xl:col-span-7">
        <CardHeader>
          <CardTitle>Application volume</CardTitle>
          <p className="text-muted-foreground text-xs">
            Applications received over the selected period.
          </p>
        </CardHeader>
        <CardContent>
          <ActivityBars points={hiring.application_activity} />
        </CardContent>
      </Card>
      <Card size="sm" className="xl:col-span-5">
        <CardHeader>
          <CardTitle>Pipeline distribution</CardTitle>
          <p className="text-muted-foreground text-xs">
            Every current application status.
          </p>
        </CardHeader>
        <CardContent>
          <StatusBars
            counts={hiring.by_status}
            total={hiring.total_applications}
          />
        </CardContent>
      </Card>
      <Card size="sm" className="xl:col-span-12">
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-muted grid size-9 place-items-center rounded-lg">
              <Clock3 className="text-muted-foreground size-4" />
            </div>
            <div>
              <p className="text-sm font-medium">Assessment deadlines</p>
              <p className="text-muted-foreground text-xs">
                {number(hiring.overdue_assessments)} active application
                {hiring.overdue_assessments === 1 ? "" : "s"} past the assessment
                deadline.
              </p>
            </div>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link href="/ats/applications">
              Review applications <ArrowUpRight />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
