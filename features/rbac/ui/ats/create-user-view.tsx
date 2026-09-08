"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { CreateHrAccountForm } from "./create-hr-account-form";

export function CreateUserView() {
  const router = useRouter();

  return (
    <div className="space-y-5">
      <Breadcrumbs
        items={[
          { label: "User accounts", href: "/ats/rbac/users/staff" },
          { label: "New" },
        ]}
      />
      <Link
        href="/ats/rbac/users/staff"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="size-4" /> User accounts
      </Link>

      <div className="max-w-2xl">
        <CreateHrAccountForm onCreated={() => router.push("/ats/rbac/users/staff")} />
      </div>
    </div>
  );
}
