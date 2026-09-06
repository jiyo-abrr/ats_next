"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { TextField } from "@/components/form/fields";
import { login } from "@/lib/store/authSlice";
import { type LoginInput, loginSchema } from "@/features/auth/schema";
import { ATS_ROLES } from "@/lib/config";
import { useAppDispatch } from "@/lib/hooks/redux";
import { useAuthLoading } from "@/features/auth/hooks";
import { toast } from "@/lib/utils/toast";

export function LoginForm() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next");
  const loading = useAuthLoading();

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const user = await dispatch(login(values)).unwrap();
      toast.success(`Welcome back, ${user.first_name}`);
      const isStaff = (ATS_ROLES as readonly string[]).includes(user.role);
      router.replace(next ?? (isStaff ? "/ats" : "/"));
      router.refresh();
    } catch {
      /* toast handled by middleware */
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <FieldGroup>
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
          autoComplete="current-password"
          required
        />
      </FieldGroup>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Signing in…" : "Sign in"}
      </Button>
      <p className="text-muted-foreground text-center text-sm">
        No account?{" "}
        <Link href="/signup" className="text-foreground font-medium underline">
          Create one
        </Link>
      </p>
    </form>
  );
}
