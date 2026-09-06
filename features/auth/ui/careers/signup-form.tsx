"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { TextField } from "@/components/form/fields";
import { signup } from "@/lib/store/authSlice";
import { type SignupInput, signupSchema } from "@/features/auth/schema";
import { useAppDispatch } from "@/lib/hooks/redux";
import { useAuthLoading } from "@/features/auth/hooks";
import { toast } from "@/lib/utils/toast";

export function SignupForm() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const loading = useAuthLoading();

  const form = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      first_name: "",
      middle_initial: "",
      last_name: "",
      contact_number: "",
      email: "",
      password: "",
      resume: undefined,
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const fd = new FormData();
    fd.set("first_name", values.first_name);
    if (values.middle_initial) fd.set("middle_initial", values.middle_initial);
    fd.set("last_name", values.last_name);
    fd.set("contact_number", values.contact_number);
    fd.set("email", values.email);
    fd.set("password", values.password);
    fd.set("resume", values.resume);

    try {
      const user = await dispatch(signup(fd)).unwrap();
      toast.success(`Welcome, ${user.first_name}! Your account is ready.`);
      router.replace("/");
      router.refresh();
    } catch {
      /* toast handled by middleware */
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <FieldGroup>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            control={form.control}
            name="first_name"
            label="First name"
            autoComplete="given-name"
            required
          />
          <TextField
            control={form.control}
            name="last_name"
            label="Last name"
            autoComplete="family-name"
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
            autoComplete="tel"
            required
          />
        </div>
        <TextField
          control={form.control}
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
          required
        />
        <TextField
          control={form.control}
          name="password"
          label="Password"
          type="password"
          autoComplete="new-password"
          description="At least 8 characters."
          required
        />

        <Controller
          control={form.control}
          name="resume"
          render={({ field, fieldState }) => (
            <Field data-invalid={!!fieldState.error}>
              <FieldLabel htmlFor="resume">
                Résumé <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="resume"
                type="file"
                accept=".pdf,.doc,.docx,application/pdf"
                onChange={(e) => field.onChange(e.target.files?.[0])}
                aria-invalid={!!fieldState.error}
              />
              <FieldDescription>
                PDF or Word document, up to 10 MB.
              </FieldDescription>
              <FieldError
                errors={fieldState.error ? [fieldState.error] : undefined}
              />
            </Field>
          )}
        />
      </FieldGroup>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creating account…" : "Create account"}
      </Button>
      <p className="text-muted-foreground text-center text-sm">
        Already have an account?{" "}
        <Link href="/login" className="text-foreground font-medium underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
