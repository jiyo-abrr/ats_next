"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { TextField } from "@/components/form/fields";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ErrorState } from "@/components/states";
import { useAppDispatch } from "@/lib/hooks/redux";
import { ROLE_LABELS } from "@/lib/constants";
import { toast } from "@/lib/utils/toast";
import { updateUser } from "@/lib/store/usersSlice";
import { useUser } from "@/features/rbac/hooks";
import { type UpdateUserInput, updateUserSchema } from "@/features/auth/schema";

export function EditUserView({ id }: { id: string }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, loading, saving, refetch } = useUser(id);

  const form = useForm<UpdateUserInput>({
    resolver: zodResolver(updateUserSchema),
    values: user
      ? {
          first_name: user.first_name,
          middle_initial: user.middle_initial ?? "",
          last_name: user.last_name,
          contact_number: user.contact_number,
          email: user.email,
        }
      : undefined,
  });

  if (!loading && !user) {
    return (
      <ErrorState message="This account could not be loaded." onRetry={refetch} />
    );
  }
  if (loading || !user) {
    return (
      <div className="max-w-2xl space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-80 w-full rounded-xl" />
      </div>
    );
  }

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await dispatch(
        updateUser({
          id,
          body: { ...values, middle_initial: values.middle_initial || null },
        }),
      ).unwrap();
      toast.success("Account updated");
      router.push("/ats/rbac/users/staff");
    } catch {
      /* toast-error middleware surfaces it */
    }
  });

  return (
    <div className="max-w-2xl space-y-5">
      <Breadcrumbs
        items={[
          { label: "User accounts", href: "/ats/rbac/users/staff" },
          { label: `${user.first_name} ${user.last_name}` },
        ]}
      />
      <Link
        href="/ats/rbac/users/staff"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="size-4" /> User accounts
      </Link>

      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          {user.first_name} {user.last_name}
        </h1>
        <Badge variant={user.role === "applicant" ? "outline" : "secondary"}>
          {ROLE_LABELS[user.role]}
        </Badge>
      </div>

      <Card>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-5">
            <FieldGroup>
              <div className="grid gap-5 sm:grid-cols-2">
                <TextField
                  control={form.control}
                  name="first_name"
                  label="First name"
                  required
                />
                <TextField
                  control={form.control}
                  name="last_name"
                  label="Last name"
                  required
                />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <TextField
                  control={form.control}
                  name="middle_initial"
                  label="Middle initial"
                />
                <TextField
                  control={form.control}
                  name="contact_number"
                  label="Contact number"
                  required
                />
              </div>
              <TextField
                control={form.control}
                name="email"
                label="Email"
                type="email"
                required
              />
            </FieldGroup>
            <div className="flex justify-end gap-2">
              <Button asChild type="button" variant="outline">
                <Link href="/ats/rbac/users/staff">Cancel</Link>
              </Button>
              <Button type="submit" disabled={saving || !form.formState.isDirty}>
                {saving ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
