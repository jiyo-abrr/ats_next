"use client";

import { useRouter } from "next/navigation";
import {
  type ColumnDef,
  type RowData,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { SortState } from "@/lib/utils/query";
import { cn } from "@/lib/cn";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    /** Backend field id to sort by; enables the sortable header button. */
    sortId?: string;
    className?: string;
  }
}

export interface DataTableProps<T> {
  columns: ColumnDef<T, unknown>[];
  data: T[] | undefined;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  sort?: SortState | null;
  onToggleSort?: (columnId: string) => void;
  emptyMessage?: string;
  skeletonRows?: number;
  getRowHref?: (row: T) => string;
  /** Ignored when `getRowHref` is also set (that one wins). */
  onRowClick?: (row: T) => void;
}

export function DataTable<T>({
  columns,
  data,
  isLoading,
  isError,
  onRetry,
  sort,
  onToggleSort,
  emptyMessage = "Nothing here yet.",
  skeletonRows = 8,
  getRowHref,
  onRowClick,
}: DataTableProps<T>) {
  const router = useRouter();
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualPagination: true,
  });

  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => {
                  const sortId = header.column.columnDef.meta?.sortId;
                  const active = sort?.id === sortId;
                  return (
                    <TableHead
                      key={header.id}
                      className={header.column.columnDef.meta?.className}
                    >
                      {header.isPlaceholder ? null : sortId && onToggleSort ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="-ml-2 h-7 gap-1 data-[active=true]:text-foreground"
                          data-active={active}
                          onClick={() => onToggleSort(sortId)}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {active ? (
                            sort?.desc ? (
                              <ArrowDown className="size-3.5" />
                            ) : (
                              <ArrowUp className="size-3.5" />
                            )
                          ) : (
                            <ChevronsUpDown className="size-3.5 opacity-50" />
                          )}
                        </Button>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: skeletonRows }).map((_, i) => (
                <TableRow key={`sk-${i}`}>
                  {columns.map((_c, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full max-w-[160px]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center">
                  <p className="text-muted-foreground text-sm">
                    Couldn&apos;t load this list.
                  </p>
                  {onRetry ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={onRetry}
                    >
                      Try again
                    </Button>
                  ) : null}
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-muted-foreground h-32 text-center text-sm"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => {
                const href = getRowHref?.(row.original);
                const clickable = !!href || !!onRowClick;
                return (
                  <TableRow
                    key={row.id}
                    className={cn(clickable && "hover:bg-muted/50 cursor-pointer")}
                    onClick={
                      href
                        ? () => router.push(href)
                        : onRowClick
                          ? () => onRowClick(row.original)
                          : undefined
                    }
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cell.column.columnDef.meta?.className}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
