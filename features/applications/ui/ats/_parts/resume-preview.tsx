"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "@/lib/utils/toast";
import { errorMessage } from "@/lib/api/client";
import { resumeBlob } from "@/features/applications/applicationsService";

export function ResumePreview({
  applicationId,
  applicantName,
}: {
  applicationId: string;
  applicantName: string;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const urlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  const ensureUrl = async () => {
    if (url) return url;
    setBusy(true);
    try {
      const blob = await resumeBlob(applicationId);
      const next = URL.createObjectURL(blob);
      urlRef.current = next;
      setUrl(next);
      return next;
    } catch (e) {
      toast.error(errorMessage(e));
      return null;
    } finally {
      setBusy(false);
    }
  };

  const toggle = async () => {
    if (open) {
      setOpen(false);
      return;
    }
    const u = await ensureUrl();
    if (u) setOpen(true);
  };

  const download = async () => {
    const u = await ensureUrl();
    if (!u) return;
    const a = document.createElement("a");
    a.href = u;
    a.download = `${applicantName.replace(/\s+/g, "_") || "resume"}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={toggle} disabled={busy}>
          {open ? <EyeOff /> : <Eye />}
          {busy ? "Loading…" : open ? "Hide" : "Preview"}
        </Button>
        <Button variant="outline" size="sm" onClick={download} disabled={busy}>
          <Download /> PDF
        </Button>
      </div>
      {open && url ? (
        <iframe
          title={`${applicantName} résumé`}
          src={url}
          className="h-[70vh] w-full rounded-md border"
        />
      ) : null}
    </div>
  );
}
