import { Suspense } from "react";
import type { Metadata } from "next";

import { ProfileView } from "@/components/profile/careers/detail/profile-view";
import { DetailSkeleton } from "@/components/page-skeleton";

export const metadata: Metadata = { title: "Profile" };

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Suspense fallback={<DetailSkeleton />}>
        <ProfileView />
      </Suspense>
    </div>
  );
}
