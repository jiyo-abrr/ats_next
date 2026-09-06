"use client";

import { SearchInput } from "@/components/data-table/search-input";

export function DataTableToolbar({
  search,
  onSearchChange,
  searchPlaceholder,
  filters,
  actions,
}: {
  search?: string;
  onSearchChange?: (v: string) => void;
  searchPlaceholder?: string;
  filters?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 pb-3">
      {onSearchChange ? (
        <SearchInput
          value={search ?? ""}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
        />
      ) : null}
      {filters}
      {actions ? <div className="ml-auto flex gap-2">{actions}</div> : null}
    </div>
  );
}
