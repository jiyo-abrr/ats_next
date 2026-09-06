import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";

type Tone = "neutral" | "info" | "success" | "warning" | "danger";

const toneClass: Record<Tone, string> = {
  neutral: "bg-muted text-muted-foreground border-transparent",
  info: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-transparent",
  success:
    "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-transparent",
  warning:
    "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-transparent",
  danger: "bg-red-500/10 text-red-700 dark:text-red-300 border-transparent",
};

export function StatusBadge({
  label,
  tone = "neutral",
  className,
}: {
  label: string;
  tone?: Tone;
  className?: string;
}) {
  return (
    <Badge className={cn("font-medium", toneClass[tone], className)}>
      {label}
    </Badge>
  );
}
