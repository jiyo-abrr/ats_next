"use client";

import { useEffect, useState } from "react";

import {
  AsyncCombobox,
  type ComboOption,
} from "@/components/form/async-combobox";
import * as positionsService from "@/features/positions/positionsService";

/**
 * Analytics scope filter — groups by position (the reusable job title), not by
 * an individual job post. Positions are few, so a client-side combobox is fine.
 */
export function PositionFilter({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  const [options, setOptions] = useState<ComboOption[]>([]);

  useEffect(() => {
    let active = true;
    void positionsService
      .getAll("size=100&sort=title:asc")
      .then((r) => {
        if (active)
          setOptions(r.items.map((p) => ({ value: p.id, label: p.title })));
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="w-52">
      <AsyncCombobox
        options={options}
        value={value || null}
        onChange={(id) => onChange(id ?? "")}
        placeholder="All positions"
        searchPlaceholder="Search positions…"
        emptyText="No positions found."
        clearable
      />
    </div>
  );
}
