import { redirect } from "next/navigation";

export default function UserAccountsPage() {
  redirect("/ats/rbac/users/staff");
}
