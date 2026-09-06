"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { CurrentQuestion } from "@/features/assessments/schema";

export type AnswerValue = string | number | boolean | string[] | null;

function options(config: Record<string, unknown> | null): string[] {
  const o = config?.options;
  return Array.isArray(o) ? (o as string[]) : [];
}

function ratingRange(config: Record<string, unknown> | null) {
  const min = typeof config?.min === "number" ? config.min : 1;
  const max = typeof config?.max === "number" ? config.max : 5;
  return { min, max };
}

export function AnswerInput({
  question,
  value,
  onChange,
}: {
  question: CurrentQuestion;
  value: AnswerValue;
  onChange: (v: AnswerValue) => void;
}) {
  const { question_type: type, config } = question;

  switch (type) {
    case "text":
      return (
        <Input
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Your answer"
          autoFocus
        />
      );

    case "long_text":
      return (
        <Textarea
          rows={6}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Your answer"
          autoFocus
        />
      );

    case "single_choice":
      return (
        <RadioGroup
          value={typeof value === "string" ? value : ""}
          onValueChange={onChange}
          className="gap-2"
        >
          {options(config).map((opt) => (
            <Label
              key={opt}
              className="hover:bg-muted/50 flex items-center gap-3 rounded-md border p-3 text-sm font-normal"
            >
              <RadioGroupItem value={opt} />
              {opt}
            </Label>
          ))}
        </RadioGroup>
      );

    case "multiple_choice": {
      const arr = Array.isArray(value) ? value : [];
      return (
        <div className="space-y-2">
          {options(config).map((opt) => {
            const checked = arr.includes(opt);
            return (
              <Label
                key={opt}
                className="hover:bg-muted/50 flex items-center gap-3 rounded-md border p-3 text-sm font-normal"
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={(c) =>
                    onChange(c ? [...arr, opt] : arr.filter((v) => v !== opt))
                  }
                />
                {opt}
              </Label>
            );
          })}
        </div>
      );
    }

    case "boolean":
      return (
        <div className="flex gap-2">
          {[
            { label: "Yes", v: true },
            { label: "No", v: false },
          ].map(({ label, v }) => (
            <Button
              key={label}
              type="button"
              variant={value === v ? "default" : "outline"}
              onClick={() => onChange(v)}
            >
              {label}
            </Button>
          ))}
        </div>
      );

    case "number":
      return (
        <Input
          type="number"
          value={typeof value === "number" ? value : ""}
          onChange={(e) =>
            onChange(e.target.value === "" ? null : Number(e.target.value))
          }
          autoFocus
        />
      );

    case "rating": {
      const { min, max } = ratingRange(config);
      const scale = Array.from({ length: max - min + 1 }, (_, i) => min + i);
      return (
        <div className="flex flex-wrap gap-2">
          {scale.map((n) => (
            <Button
              key={n}
              type="button"
              variant={value === n ? "default" : "outline"}
              size="icon"
              className="size-10"
              onClick={() => onChange(n)}
            >
              {n}
            </Button>
          ))}
        </div>
      );
    }

    case "date":
      return (
        <Input
          type="date"
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value || null)}
        />
      );

    default:
      return null;
  }
}

/** Minimal client-side gate before hitting the API (backend validates fully). */
export function isAnswerComplete(
  question: CurrentQuestion,
  value: AnswerValue,
): boolean {
  switch (question.question_type) {
    case "text":
    case "long_text":
    case "date":
      return typeof value === "string" && value.trim().length > 0;
    case "single_choice":
      return typeof value === "string" && value.length > 0;
    case "multiple_choice": {
      if (!Array.isArray(value) || value.length === 0) return false;
      const min = Number(question.config?.min_selections ?? 0);
      return value.length >= min;
    }
    case "boolean":
      return typeof value === "boolean";
    case "number":
    case "rating":
      return typeof value === "number" && !Number.isNaN(value);
    default:
      return false;
  }
}
