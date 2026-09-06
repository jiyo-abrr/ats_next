"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  Building2,
  ChevronDown,
  ClipboardList,
  LayoutDashboard,
  ListChecks,
  ShieldCheck,
  Tags,
  Users,
} from "lucide-react";

import { Logo } from "@/components/logo";
import { UserMenu } from "@/components/user-menu";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/cn";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
  children?: { href: string; label: string }[];
};

const nav: NavItem[] = [
  { href: "/ats", label: "Dashboard", icon: LayoutDashboard },
  { href: "/ats/job-posts", label: "Job posts", icon: Briefcase },
  { href: "/ats/applications", label: "Applications", icon: ClipboardList },
  { href: "/ats/positions", label: "Positions", icon: Users },
  { href: "/ats/tags", label: "Tags", icon: Tags },
  { href: "/ats/company-addresses", label: "Locations", icon: Building2 },
  {
    href: "/ats/templates",
    label: "Assessments",
    icon: ListChecks,
    children: [
      { href: "/ats/templates/pre-assessment", label: "Pre-assessment" },
      { href: "/ats/templates/culture-fit", label: "Culture fit" },
      { href: "/ats/templates/technical-assessment", label: "Technical" },
    ],
  },
  {
    href: "/ats/rbac",
    label: "Access control",
    icon: ShieldCheck,
    adminOnly: true,
  },
];

const linkClass = (active: boolean) =>
  cn(
    "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
    active
      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
      : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50",
  );

function NavGroup({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const groupActive = pathname.startsWith(item.href);
  const [open, setOpen] = useState(groupActive);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={cn(linkClass(groupActive && !open), "w-full")}
      >
        <item.icon className="size-4" />
        {item.label}
        <ChevronDown
          className={cn(
            "ml-auto size-4 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open ? (
        <div className="mt-1 ml-4 space-y-1 border-l pl-3">
          {item.children!.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              className={linkClass(pathname === child.href)}
            >
              {child.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function AtsShell({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div data-surface="ats" className="flex min-h-full">
      <aside className="bg-sidebar text-sidebar-foreground hidden w-60 shrink-0 flex-col border-r md:flex">
        <div className="flex h-14 items-center border-b px-4">
          <Logo href="/ats" subtitle="ATS console" />
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {nav.map((item) => {
            if (item.adminOnly && role !== "admin") return null;
            if (item.children) return <NavGroup key={item.href} item={item} />;
            const active =
              item.href === "/ats"
                ? pathname === "/ats"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={linkClass(active)}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-3 border-b px-4">
          <div className="md:hidden">
            <Logo href="/ats" />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <UserMenu homeHref="/ats" />
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
