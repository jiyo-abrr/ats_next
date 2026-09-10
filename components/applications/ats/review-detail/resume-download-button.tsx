"use client";

import { useState } from "react";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "@/lib/utils/toast";
import { errorMessage } from "@/lib/api/client";
import { resumeBlob } from "@/features/applications/applicationsService";

export function ResumeDownloadButton({
  id,
  applicantName,
}: {
  id: string;
  applicantName: string;
}) {
  const [busy, setBusy] = useState(false);

  const download = async () => {
    setBusy(true);
    try {
      const blob = await resumeBlob(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${applicantName.replace(/\s+/g, "_") || "resume"}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={download} disabled={busy}>
      <Download /> {busy ? "Downloading…" : "Résumé"}
    </Button>
  );
}
