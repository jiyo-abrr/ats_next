"use client";

/** Legend for the dimension-rating columns. */
export function RatingLegend() {
  return (
    <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
      <span className="flex items-center gap-1.5">
        <span className="bg-emerald-500 size-2 rounded-full" />
        Strong
      </span>
      <span className="flex items-center gap-1.5">
        <span className="bg-amber-500 size-2 rounded-full" />
        Qualified
      </span>
      <span className="flex items-center gap-1.5">
        <span className="bg-red-500 size-2 rounded-full" />
        Below bar
      </span>
    </div>
  );
}
