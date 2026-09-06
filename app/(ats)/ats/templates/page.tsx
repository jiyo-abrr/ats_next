import { redirect } from "next/navigation";

import { TEMPLATE_KINDS } from "@/features/templates/schema";

export default function TemplatesPage() {
  redirect(`/ats/templates/${TEMPLATE_KINDS[0]}`);
}
