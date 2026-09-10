"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, MapPin, Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface GeocodeResult {
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    house_number?: string;
    road?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
}

/** Address search backed by OpenStreetMap's Nominatim geocoder — debounced,
 * with a results dropdown. Selecting a result hands the full record back. */
export function LocationSearch({
  onSelect,
}: {
  onSelect: (result: GeocodeResult) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 3) return;
    const controller = new AbortController();
    const t = setTimeout(() => {
      setLoading(true);
      fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=5&q=${encodeURIComponent(q)}`,
        { signal: controller.signal },
      )
        .then((res) => (res.ok ? (res.json() as Promise<GeocodeResult[]>) : []))
        .then((data) => {
          setResults(data);
          setOpen(true);
        })
        .catch(() => {
          /* aborted or offline — leave the previous results in place */
        })
        .finally(() => setLoading(false));
    }, 400);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  // Short queries never fetch — don't show whatever the last long query left behind.
  const visibleResults = query.trim().length >= 3 ? results : [];

  return (
    <div ref={containerRef} className="relative w-full">
      <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => visibleResults.length > 0 && setOpen(true)}
        placeholder="Search an address…"
        className="pl-8 pr-8"
      />
      {loading ? (
        <Loader2 className="text-muted-foreground absolute top-1/2 right-2.5 size-4 -translate-y-1/2 animate-spin" />
      ) : query ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="absolute top-1/2 right-1 -translate-y-1/2"
          onClick={() => {
            setQuery("");
            setResults([]);
          }}
        >
          <X />
        </Button>
      ) : null}

      {open && visibleResults.length > 0 ? (
        <div className="bg-popover text-popover-foreground absolute z-[1000] mt-1 w-full overflow-hidden rounded-lg border shadow-md">
          {visibleResults.map((r, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                onSelect(r);
                setQuery(r.display_name);
                setOpen(false);
              }}
              className="hover:bg-muted flex w-full items-start gap-2 px-3 py-2 text-left text-sm"
            >
              <MapPin className="text-muted-foreground mt-0.5 size-4 shrink-0" />
              <span className="line-clamp-2">{r.display_name}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
