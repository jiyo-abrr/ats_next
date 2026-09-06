"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SearchInput({
  value,
  onChange,
  placeholder = "Search…",
  debounceMs = 350,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
}) {
  const [local, setLocal] = useState(value);
  const [syncedValue, setSyncedValue] = useState(value);
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  // Reflect an external value change (e.g. filters cleared) into the input
  // without an effect — React's "adjust state during render" pattern.
  if (value !== syncedValue) {
    setSyncedValue(value);
    setLocal(value);
  }

  useEffect(() => {
    if (local === value) return;
    const t = setTimeout(() => onChangeRef.current(local), debounceMs);
    return () => clearTimeout(t);
  }, [local, value, debounceMs]);

  return (
    <div className="relative w-full max-w-xs">
      <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
      <Input
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={placeholder}
        className="pl-8"
      />
      {local ? (
        <Button
          variant="ghost"
          size="icon-xs"
          className="absolute top-1/2 right-1 -translate-y-1/2"
          onClick={() => setLocal("")}
        >
          <X />
        </Button>
      ) : null}
    </div>
  );
}
