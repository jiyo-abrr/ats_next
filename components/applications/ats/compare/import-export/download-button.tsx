"use client";

import { Button } from "@/components/ui/button";
import { errorMessage } from "@/lib/api/client";
import { toast } from "@/lib/utils/toast";
import { FileArchive } from "lucide-react";
import { useState } from "react";

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function DownloadButton({
  icon: Icon,
  label,
  busyLabel,
  fetcher,
  filename,
}: {
  icon: typeof FileArchive;
  label: string;
  busyLabel: string;
  fetcher: () => Promise<Blob>;
  filename: string;
}) {
  const [busy, setBusy] = useState(false);
  const run = async () => {
    setBusy(true);
    try {
      triggerDownload(await fetcher(), filename);
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <Button variant="outline" size="sm" onClick={run} disabled={busy}>
      <Icon className="size-4" />
      {busy ? busyLabel : label}
    </Button>
  );
}
