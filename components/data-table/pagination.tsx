"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function DataTablePagination({
  page,
  size,
  total,
  pages,
  onPageChange,
  onSizeChange,
  isLoading,
}: {
  page: number;
  size: number;
  total: number;
  pages: number;
  onPageChange: (page: number) => void;
  onSizeChange: (size: number) => void;
  isLoading?: boolean;
}) {
  const from = total === 0 ? 0 : (page - 1) * size + 1;
  const to = Math.min(page * size, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-1 text-sm">
      <p className="text-muted-foreground">
        {isLoading ? "Loading…" : `${from}–${to} of ${total}`}
      </p>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Rows</span>
          <Select
            value={String(size)}
            onValueChange={(v) => onSizeChange(Number(v))}
          >
            <SelectTrigger size="sm" className="w-[72px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 50, 100].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            disabled={page <= 1 || isLoading}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft />
          </Button>
          <span className="text-muted-foreground px-1">
            {page} / {Math.max(1, pages)}
          </span>
          <Button
            variant="outline"
            size="icon-sm"
            disabled={page >= pages || isLoading}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
