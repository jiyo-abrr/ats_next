"use client";

import { Button } from "@/components/ui/button";
import { resumeBlob } from "@/features/applications/applicationsService";
import { errorMessage } from "@/lib/api/client";
import { toast } from "@/lib/utils/toast";
import { Download, Eye } from "lucide-react";
import { useState } from "react";

export function ResumeCell({ id, name }: { id: string; name: string }) {
  const [busy, setBusy] = useState(false);
  const withBlob = async (fn: (url: string) => void) => {
    setBusy(true);
    try {
      fn(URL.createObjectURL(await resumeBlob(id)));
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="flex gap-1">
      <Button
        variant="outline"
        size="sm"
        className="h-7 px-2 text-xs"
        disabled={busy}
        onClick={(e) => {
          e.stopPropagation();
          withBlob((url) => window.open(url, "_blank", "noopener"));
        }}
      >
        <Eye className="size-3" /> View
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="h-7 px-2 text-xs"
        disabled={busy}
        onClick={(e) => {
          e.stopPropagation();
          withBlob((url) => {
            const a = document.createElement("a");
            a.href = url;
            a.download = `${name.replace(/\s+/g, "_")}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
          });
        }}
      >
        <Download className="size-3" /> PDF
      </Button>
    </div>
  );
}
