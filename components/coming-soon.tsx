import { Hammer } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/states";

export function ComingSoon({
  title,
  phase,
}: {
  title: string;
  phase: string;
}) {
  return (
    <div>
      <PageHeader title={title} />
      <EmptyState
        icon={Hammer}
        title="Not built yet"
        description={`This screen arrives in ${phase}.`}
      />
    </div>
  );
}
