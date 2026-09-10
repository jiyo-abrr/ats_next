import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export function CareersHomeView() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-24">
      <div className="max-w-2xl space-y-6">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Find your next role
        </h1>
        <p className="text-muted-foreground text-lg">
          Browse open positions, apply with your résumé, and track every step of
          the hiring process — from assessments to the final decision — in one
          place.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/jobs">
              Browse open roles <ArrowRight />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/signup">Create an account</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
