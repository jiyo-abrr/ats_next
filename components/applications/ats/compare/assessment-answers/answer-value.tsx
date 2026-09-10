/** Renders an assessment answer_value (shape varies by question type). */
export function AnswerValue({ value }: { value: unknown }) {
  if (value === null || value === undefined || value === "") {
    return <span className="text-muted-foreground">—</span>;
  }
  if (typeof value === "boolean") return <span>{value ? "Yes" : "No"}</span>;
  if (Array.isArray(value)) {
    return (
      <ul className="list-inside list-disc space-y-0.5">
        {value.map((v, i) => (
          <li key={i}>{String(v)}</li>
        ))}
      </ul>
    );
  }
  return <span className="whitespace-pre-wrap">{String(value)}</span>;
}
