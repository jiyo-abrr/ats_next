"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { TextField } from "@/components/form/fields";
import { errorMessage } from "@/lib/api/client";
import { toast } from "@/lib/utils/toast";
import { createHrAccount } from "@/features/auth/authService";
import {
  type CreateHrAccountInput,
  createHrAccountSchema,
} from "@/features/auth/schema";

export function CreateHrAccountForm({
  onCreated,
}: {
  /** Called after a successful create, instead of resetting the form in place. */
  onCreated?: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const form = useForm<CreateHrAccountInput>({
    resolver: zodResolver(createHrAccountSchema),
    defaultValues: {
      first_name: "",
      middle_initial: "",
      last_name: "",
      contact_number: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setBusy(true);
    try {
      await createHrAccount({
        ...values,
        middle_initial: values.middle_initial || null,
      });
      toast.success(`HR account created for ${values.email}`);
      if (onCreated) {
        onCreated();
      } else {
        form.reset();
      }
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(false);
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create HR account</CardTitle>
      </CardHeader>
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
            <TextField
              control={form.control}
              name="password"
              label="Temporary password"
              type="password"
              description="At least 8 characters."
              required
            />
          </FieldGroup>
          <div className="flex justify-end">
            <Button type="submit" disabled={busy}>
              {busy ? "Creating…" : "Create account"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
