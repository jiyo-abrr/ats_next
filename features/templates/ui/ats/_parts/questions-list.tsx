import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/states";
import { QUESTION_TYPE_LABELS } from "@/lib/constants";
import type { TemplateQuestion } from "@/features/templates/schema";

export function QuestionsList({ questions }: { questions: TemplateQuestion[] }) {
  const sorted = [...questions].sort((a, b) => a.order_index - b.order_index);

  if (sorted.length === 0) {
    return (
      <EmptyState
        title="No questions yet"
        description="Add questions below — applicants answer them in order."
        className="py-10"
      />
    );
  }

  return (
    <ol className="space-y-2">
      {sorted.map((q, i) => {
        const opts = Array.isArray(q.config?.options)
          ? (q.config!.options as string[])
          : [];
        return (
          <li key={q.id} className="rounded-lg border p-3">
            <div className="flex items-start gap-3">
              <span className="text-muted-foreground text-sm tabular-nums">
                {i + 1}.
              </span>
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-sm font-medium">{q.prompt}</p>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant="secondary" className="font-normal">
                    {QUESTION_TYPE_LABELS[q.question_type]}
                  </Badge>
                  {q.time_limit_seconds ? (
                    <Badge variant="outline" className="font-normal">
                      {q.time_limit_seconds}s
                    </Badge>
                  ) : null}
                </div>
                {opts.length ? (
                  <p className="text-muted-foreground text-xs">
                    {opts.join(" · ")}
                  </p>
                ) : null}
                {q.instructions ? (
                  <p className="text-muted-foreground text-xs">
                    {q.instructions}
                  </p>
                ) : null}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
