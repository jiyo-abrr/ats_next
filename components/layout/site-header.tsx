"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Logo } from "@/components/logo";
import { UserMenu } from "@/components/user-menu";
import {
  useAuthResolved,
  useCurrentUser,
  useIsStaff,
} from "@/features/auth/hooks";
import { cn } from "@/lib/cn";

const navLinks = [
  { href: "/", label: "Jobs", exact: true },
  { href: "/applications", label: "My applications", auth: true },
];

export function SiteHeader() {
  const user = useCurrentUser();
  const resolved = useAuthResolved();
  const isStaff = useIsStaff();
  const pathname = usePathname();

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4">
        <Logo subtitle="Careers" />

        <nav className="flex items-center gap-1 text-sm">
          {navLinks.map((link) => {
            if (link.auth && !user) return null;
            const active = link.exact
              ? pathname === link.href
              : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-2.5 py-1.5 transition-colors",
                  active
                    ? "bg-muted text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {!resolved ? (
            <Skeleton className="h-8 w-20" />
          ) : user ? (
            <>
              {isStaff ? (
                <Button asChild variant="outline" size="sm">
                  <Link href="/ats">ATS console</Link>
                </Button>
              ) : null}
              <UserMenu />
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/signup">Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
