import type { TemplateType } from "@/lib/types";

export const TEMPLATE_ORDER: TemplateType[] = [
  "pre_assessment",
  "culture_fit",
  "technical",
];

export const RECOMMENDATION_LABELS: Record<string, string> = {
  advance: "Advance",
  hold: "Hold",
  reject: "Reject",
};
