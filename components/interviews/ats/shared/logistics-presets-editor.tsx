"use client";

import { useEffect, useState } from "react";
import { Link2, MapPin, Plus, X } from "lucide-react";

import { AddressMap } from "@/components/address-map";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAll } from "@/features/company-addresses/companyAddressesService";
import type { CompanyAddress } from "@/features/company-addresses/schema";
import type { LogisticsPresetInput, LogisticsMode } from "@/features/interviews/schema";

const SECTIONS: { mode: LogisticsMode; title: string; placeholder: string }[] = [
  { mode: "video", title: "Video call links", placeholder: "https://meet.example.com/…" },
  { mode: "onsite", title: "On-site addresses", placeholder: "5F, Tower One, BGC, Taguig" },
];

const formatAddress = (a: CompanyAddress) =>
  [a.line1, a.line2, a.city, a.state_province, a.country].filter(Boolean).join(", ");

/** A managed list of named, reusable logistics values per mode (video links,
 * on-site addresses). Controlled — mirrors AvailabilityEditor's shape. An
 * on-site row can either be typed free text or linked to a saved company
 * address (picked from the address book), which shows a map preview. */
export function LogisticsPresetsEditor({
  presets,
  onChange,
  disabled,
}: {
  presets: LogisticsPresetInput[];
  onChange: (next: LogisticsPresetInput[]) => void;
  disabled?: boolean;
}) {
  const [addresses, setAddresses] = useState<CompanyAddress[]>([]);

  useEffect(() => {
    let active = true;
    void getAll("size=100")
      .then((r) => active && setAddresses(r.items))
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const forMode = (mode: LogisticsMode) =>
    presets.map((p, i) => ({ p, i })).filter((r) => r.p.mode === mode);

  const update = (index: number, patch: Partial<LogisticsPresetInput>) =>
    onChange(presets.map((p, i) => (i === index ? { ...p, ...patch } : p)));

  const remove = (index: number) => onChange(presets.filter((_, i) => i !== index));

  const add = (mode: LogisticsMode) =>
    onChange([...presets, { mode, label: "", value: "", company_address_id: null }]);

  return (
    <div className="space-y-5">
      {SECTIONS.map(({ mode, title, placeholder }) => {
        const rows = forMode(mode);
        return (
          <div key={mode} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{title}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={disabled}
                onClick={() => add(mode)}
              >
                <Plus className="size-3.5" /> Add
              </Button>
            </div>
            {rows.length === 0 ? (
              <p className="text-muted-foreground text-xs">None set yet.</p>
            ) : (
              <div className="space-y-3">
                {rows.map(({ p, i }) => {
                  const linked = mode === "onsite" && p.company_address_id
                    ? addresses.find((a) => a.id === p.company_address_id)
                    : undefined;
                  return (
                    <div key={i} className="space-y-1.5 rounded-md border p-2.5">
                      <div className="flex items-center gap-2">
                        <Input
                          value={p.label}
                          disabled={disabled}
                          onChange={(e) => update(i, { label: e.target.value })}
                          placeholder="Name"
                          className="w-36 shrink-0"
                        />
                        {mode === "onsite" && p.company_address_id ? (
                          <div className="text-muted-foreground flex flex-1 items-center gap-1.5 rounded-md border border-dashed px-3 py-1.5 text-sm">
                            <MapPin className="size-3.5 shrink-0" />
                            <span className="flex-1 truncate">
                              {linked ? formatAddress(linked) : "Linked address"}
                            </span>
                            <button
                              type="button"
                              disabled={disabled}
                              onClick={() => update(i, { company_address_id: null, value: "" })}
                              className="hover:text-foreground shrink-0 underline underline-offset-2"
                            >
                              Unlink
                            </button>
                          </div>
                        ) : (
                          <Input
                            value={p.value}
                            disabled={disabled}
                            onChange={(e) => update(i, { value: e.target.value })}
                            placeholder={placeholder}
                            className="flex-1"
                          />
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-9 shrink-0"
                          disabled={disabled}
                          onClick={() => remove(i)}
                          aria-label={`Remove ${p.label || title.toLowerCase()}`}
                        >
                          <X className="size-4" />
                        </Button>
                      </div>

                      {mode === "onsite" && !p.company_address_id && addresses.length > 0 ? (
                        <Select
                          value=""
                          disabled={disabled}
                          onValueChange={(id) =>
                            update(i, { company_address_id: id, value: "" })
                          }
                        >
                          <SelectTrigger size="sm" className="w-full">
                            <Link2 className="size-3.5" />
                            <SelectValue placeholder="Or link a saved address…" />
                          </SelectTrigger>
                          <SelectContent>
                            {addresses.map((a) => (
                              <SelectItem key={a.id} value={a.id}>
                                {a.label} — {formatAddress(a)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : null}

                      {linked ? (
                        <AddressMap
                          latitude={linked.latitude}
                          longitude={linked.longitude}
                          label={linked.label}
                          className="h-32 w-full rounded-md border"
                        />
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
