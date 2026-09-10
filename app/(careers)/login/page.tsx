import type { Metadata } from "next";

import { LoginView } from "@/components/auth/careers/login/login-view";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return <LoginView />;
}
