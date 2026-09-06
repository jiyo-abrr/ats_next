import { redirect } from "next/navigation";

import { AtsShell } from "@/components/layout/ats-shell";
import { ATS_ROLES } from "@/lib/config";
import { getServerUser } from "@/lib/server/api";

export default async function AtsLayout({ children }: { children: React.ReactNode }) {
  const user = await getServerUser();

  if (!user) redirect("/login?next=/ats");
  if (!(ATS_ROLES as readonly string[]).includes(user.role)) redirect("/");

  return <AtsShell role={user.role}>{children}</AtsShell>;
}
