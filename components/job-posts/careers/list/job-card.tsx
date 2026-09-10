import Link from "next/link";
import { Building2, Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EMPLOYMENT_TYPE_LABELS } from "@/lib/constants";
import { salaryLabel } from "@/lib/utils/format";
import type { JobPost } from "@/features/job-posts/schema";

export function JobCard({ job }: { job: JobPost }) {
  const salary = salaryLabel(job);
  return (
    <Card className="hover:border-foreground/20 transition-colors">
      <Link href={`/jobs/${job.id}`}>
        <CardContent className="space-y-3 p-5">
          <div className="space-y-1">
            <h3 className="font-semibold tracking-tight">{job.job_title}</h3>
            <p className="text-muted-foreground text-sm">{job.position_title}</p>
          </div>
          <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
            <span className="flex items-center gap-1">
              <Building2 className="size-3.5" />
              {job.company_address_label}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" />
              {EMPLOYMENT_TYPE_LABELS[job.employment_type]}
            </span>
            {salary ? <span>{salary}</span> : null}
          </div>
          {job.tags.length ? (
            <div className="flex flex-wrap gap-1.5">
              {job.tags.slice(0, 4).map((t) => (
                <Badge key={t.id} variant="secondary" className="font-normal">
                  {t.name}
                </Badge>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Link>
    </Card>
  );
}
