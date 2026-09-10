import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { EditUserView } from "@/components/rbac/ats/edit-user/edit-user-view";
import { FormSkeleton } from "@/components/page-skeleton";
import { getServerUser } from "@/lib/server/api";

export const metadata: Metadata = { title: "Edit account" };

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getServerUser();
  if (user?.role !== "admin") redirect("/ats");
  const { id } = await params;
  return (
    <Suspense fallback={<FormSkeleton />}>
      <EditUserView id={id} />
    </Suspense>
  );
}
