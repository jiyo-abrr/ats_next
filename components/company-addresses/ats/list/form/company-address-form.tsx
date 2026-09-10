"use client";

import dynamic from "next/dynamic";
import type { UseFormReturn } from "react-hook-form";
import { LocateFixed } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { TextField } from "@/components/form/fields";
import { toast } from "@/lib/utils/toast";
import type { CompanyAddressInput } from "@/features/company-addresses/schema";
import { type GeocodeResult, LocationSearch } from "./location-search";

// Leaflet touches `window` at import time — load it client-only, after the
// sheet has actually mounted, instead of pulling it into the main bundle.
const LocationMap = dynamic(
  () => import("../shared/location-map").then((m) => m.LocationMap),
  { ssr: false, loading: () => <Skeleton className="h-64 w-full rounded-lg" /> },
);

export function CompanyAddressForm({
  form,
}: {
  form: UseFormReturn<CompanyAddressInput>;
}) {
  const latitude = form.watch("latitude");
  const longitude = form.watch("longitude");
  const lat = latitude ? Number(latitude) : null;
  const lng = longitude ? Number(longitude) : null;

  const setPosition = (nextLat: number, nextLng: number) => {
    form.setValue("latitude", nextLat.toFixed(6), { shouldDirty: true });
    form.setValue("longitude", nextLng.toFixed(6), { shouldDirty: true });
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation isn't supported in this browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setPosition(pos.coords.latitude, pos.coords.longitude),
      () => toast.error("Couldn't get your current location"),
    );
  };

  const onSearchSelect = (result: GeocodeResult) => {
    setPosition(Number(result.lat), Number(result.lon));

    const a = result.address;
    if (!a) return;
    const line1 = [a.house_number, a.road].filter(Boolean).join(" ");
    if (line1) form.setValue("line1", line1, { shouldDirty: true });
    const city = a.city ?? a.town ?? a.village;
    if (city) form.setValue("city", city, { shouldDirty: true });
    if (a.state) form.setValue("state_province", a.state, { shouldDirty: true });
    if (a.postcode) form.setValue("postal_code", a.postcode, { shouldDirty: true });
    if (a.country) form.setValue("country", a.country, { shouldDirty: true });
  };

  return (
    <FieldGroup>
      <TextField
        control={form.control}
        name="label"
        label="Label"
        placeholder="HQ, Cebu office…"
        required
      />
      <TextField
        control={form.control}
        name="line1"
        label="Address line 1"
        required
      />
      <TextField control={form.control} name="line2" label="Address line 2" />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField control={form.control} name="city" label="City" required />
        <TextField
          control={form.control}
          name="state_province"
          label="State / province"
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          control={form.control}
          name="postal_code"
          label="Postal code"
        />
        <TextField
          control={form.control}
          name="country"
          label="Country"
          required
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium">Map location</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={useCurrentLocation}
          >
            <LocateFixed /> Use my current location
          </Button>
        </div>
        <LocationSearch onSelect={onSearchSelect} />
        <LocationMap lat={lat} lng={lng} onPick={setPosition} />
        <p className="text-muted-foreground text-xs">
          Search an address, click the map to drop the pin, or enter
          coordinates directly.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField control={form.control} name="latitude" label="Latitude" />
        <TextField control={form.control} name="longitude" label="Longitude" />
      </div>
    </FieldGroup>
  );
}
