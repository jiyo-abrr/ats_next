import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { CreateUserView } from "@/features/rbac/ui/ats/create-user-view";
import { FormSkeleton } from "@/components/page-skeleton";
import { getServerUser } from "@/lib/server/api";

export const metadata: Metadata = { title: "New HR account" };

export default async function NewUserPage() {
  const user = await getServerUser();
  if (user?.role !== "admin") redirect("/ats");
  return (
    <Suspense fallback={<FormSkeleton />}>
      <CreateUserView />
    </Suspense>
  );
}
