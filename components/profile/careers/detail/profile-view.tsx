"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { useCurrentUser } from "@/features/auth/hooks";
import { ROLE_LABELS } from "@/lib/constants";
import { formatDate, fullName } from "@/lib/utils/format";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b py-2.5 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

export function ProfileView() {
  const user = useCurrentUser();

  if (!user) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <div>
      <PageHeader title="Profile" />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {fullName(user)}
            <StatusBadge label={ROLE_LABELS[user.role]} tone="info" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Row label="Email" value={user.email} />
          <Row label="Contact number" value={user.contact_number} />
          <Row label="Member since" value={formatDate(user.created_at)} />
        </CardContent>
      </Card>
      <p className="text-muted-foreground mt-3 text-xs">
        Profile editing isn&apos;t available in this portal yet.
      </p>
    </div>
  );
}
