import { Suspense } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SignupForm } from "./signup-form";
import { FormSkeleton } from "@/components/page-skeleton";

export function SignupView() {
  return (
    <div className="mx-auto flex max-w-lg flex-col justify-center px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle>Create your applicant account</CardTitle>
          <CardDescription>
            Sign up to apply for open roles and track your progress.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<FormSkeleton />}>
            <SignupForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
