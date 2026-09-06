import { Fragment } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="text-muted-foreground flex items-center gap-1 text-sm"
    >
      {items.map((item, i) => {
        const last = i === items.length - 1;
        return (
          <Fragment key={i}>
            {item.href && !last ? (
              <Link href={item.href} className="hover:text-foreground">
                {item.label}
              </Link>
            ) : (
              <span className={last ? "text-foreground font-medium" : undefined}>
                {item.label}
              </span>
            )}
            {!last ? <ChevronRight className="size-3.5" /> : null}
          </Fragment>
        );
      })}
    </nav>
  );
}
