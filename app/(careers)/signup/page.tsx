import type { Metadata } from "next";

import { SignupView } from "@/components/auth/careers/signup/signup-view";

export const metadata: Metadata = { title: "Create account" };

export default function SignupPage() {
  return <SignupView />;
}
