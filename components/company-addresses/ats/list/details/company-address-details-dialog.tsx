"use client";

import dynamic from "next/dynamic";
import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import type { CompanyAddress } from "@/features/company-addresses/schema";

// Same client-only load as the form's map — Leaflet needs `window`.
const LocationMap = dynamic(
  () => import("../shared/location-map").then((m) => m.LocationMap),
  { ssr: false, loading: () => <Skeleton className="h-80 w-full rounded-lg" /> },
);

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="text-sm">{value}</dd>
    </div>
  );
}

export function CompanyAddressDetailsDialog({
  address,
  onOpenChange,
  onEdit,
}: {
  address: CompanyAddress | null;
  onOpenChange: (open: boolean) => void;
  onEdit: (address: CompanyAddress) => void;
}) {
  const lat = address?.latitude ? Number(address.latitude) : null;
  const lng = address?.longitude ? Number(address.longitude) : null;

  return (
    <Dialog open={!!address} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        {address ? (
          <>
            <DialogHeader>
              <DialogTitle>{address.label}</DialogTitle>
            </DialogHeader>

            <dl className="grid grid-cols-2 gap-4">
              <Field
                label="Address"
                value={[address.line1, address.line2].filter(Boolean).join(", ")}
              />
              <Field label="City" value={address.city} />
              <Field
                label="State / province"
                value={address.state_province || "—"}
              />
              <Field label="Postal code" value={address.postal_code || "—"} />
              <Field label="Country" value={address.country} />
              <Field
                label="Coordinates"
                value={lat != null && lng != null ? `${lat}, ${lng}` : "—"}
              />
            </dl>

            {lat != null && lng != null ? (
              <LocationMap
                lat={lat}
                lng={lng}
                zoom={17}
                className="h-80 w-full overflow-hidden rounded-lg border"
              />
            ) : null}

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button onClick={() => onEdit(address)}>
                <Pencil /> Edit
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
