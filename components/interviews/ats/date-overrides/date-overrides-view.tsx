"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/states";
import { toast } from "@/lib/utils/toast";
import { setDateOverrides } from "@/features/interviews/interviewsService";
import { useDateOverrides } from "@/features/interviews/hooks";
import {
  CSV_TEMPLATE,
  parseOverridesCsv,
} from "@/features/interviews/overrides-csv";
import type { DateOverride } from "@/features/interviews/schema";
import { OverridesCalendar } from "./overrides-calendar";

const toInput = (o: DateOverride) => ({
  start_date: o.start_date,
  end_date: o.end_date,
  is_unavailable: o.is_unavailable,
  start: o.start,
  end: o.end,
  note: o.note,
});

const snapshot = (rows: DateOverride[]) =>
  JSON.stringify(
    [...rows].sort((a, b) => a.start_date.localeCompare(b.start_date)).map(toInput),
  );

export function DateOverridesView() {
  const { data, loading, error, refetch } = useDateOverrides();

  if (error)
    return (
      <ErrorState message="Couldn't load date overrides." onRetry={refetch} />
    );
  if (loading || !data)
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-[24rem] w-full" />
      </div>
    );

  return <Editor key={data.length} initial={data} />;
}

function Editor({ initial }: { initial: DateOverride[] }) {
  const [rows, setRows] = useState<DateOverride[]>(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(() => snapshot(initial));
  const [importOpen, setImportOpen] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [csvErrors, setCsvErrors] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const dirty = snapshot(rows) !== saved;

  const save = async () => {
    for (const o of rows) {
      if (o.end_date < o.start_date) {
        toast.error("A row ends before it starts — fix it before saving.");
        return;
      }
      if (!o.is_unavailable && (!o.start || !o.end || o.end <= o.start)) {
        toast.error("A custom-hours row is missing a valid time range.");
        return;
      }
    }
    setSaving(true);
    try {
      const next = await setDateOverrides(rows.map(toInput));
      setRows(next);
      setSaved(snapshot(next));
      toast.success("Date overrides saved");
    } catch {
      /* handled */
    } finally {
      setSaving(false);
    }
  };

  const applyCsv = (text: string) => {
    const { rows: parsed, errors } = parseOverridesCsv(text);
    setCsvErrors(errors);
    if (parsed.length === 0) {
      if (errors.length === 0) toast.error("No rows found in the CSV.");
      return;
    }
    setRows((prev) => [
      ...prev,
      ...parsed.map((p) => ({
        id: crypto.randomUUID(),
        start_date: p.start_date,
        end_date: p.end_date ?? p.start_date,
        is_unavailable: p.is_unavailable ?? true,
        start: p.start ?? null,
        end: p.end ?? null,
        note: p.note ?? null,
      })),
    ]);
    setCsvText("");
    toast.success(
      `Added ${parsed.length} row${parsed.length === 1 ? "" : "s"}` +
        (errors.length ? ` — ${errors.length} skipped` : ""),
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Date overrides
          </h1>
          <p className="text-muted-foreground text-sm">
            {rows.length} override{rows.length === 1 ? "" : "s"} · exceptions to
            the weekly hours for specific dates.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setImportOpen((v) => !v)}
          >
            <Upload className="size-3.5" /> Import CSV
          </Button>
          {dirty ? (
            <span className="text-muted-foreground text-xs">Unsaved</span>
          ) : null}
          <Button onClick={save} disabled={saving || !dirty}>
            {saving ? "Saving…" : dirty ? "Save" : "Saved"}
          </Button>
        </div>
      </div>

      {importOpen ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Import from CSV</CardTitle>
            <p className="text-muted-foreground text-xs">
              Columns: <code>start_date, end_date, type, start, end, note</code>.
              <code> type</code> is <code>blocked</code> or <code>hours</code>;{" "}
              <code>end_date</code> blank means one day. Rows are added to the
              list below — nothing saves until you hit Save.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder={CSV_TEMPLATE}
              rows={5}
              className="font-mono text-xs"
            />
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              hidden
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) applyCsv(await file.text());
                e.target.value = "";
              }}
            />
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={() => applyCsv(csvText)}
                disabled={!csvText.trim()}
              >
                Add rows
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => fileRef.current?.click()}
              >
                Upload a file
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  void navigator.clipboard?.writeText(CSV_TEMPLATE);
                  toast.success("Template copied");
                }}
              >
                Copy template
              </Button>
            </div>
            {csvErrors.length > 0 ? (
              <ul className="text-destructive space-y-0.5 text-xs">
                {csvErrors.slice(0, 8).map((msg, i) => (
                  <li key={i}>{msg}</li>
                ))}
                {csvErrors.length > 8 ? (
                  <li>…and {csvErrors.length - 8} more.</li>
                ) : null}
              </ul>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardContent className="pt-6">
          <OverridesCalendar
            rows={rows}
            onChange={setRows}
            disabled={saving}
          />
        </CardContent>
      </Card>
    </div>
  );
}
