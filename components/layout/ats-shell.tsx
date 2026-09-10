"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  Building2,
  CalendarClock,
  ChartNoAxesCombined,
  ChevronDown,
  ClipboardList,
  LayoutDashboard,
  ListChecks,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
  Tags,
  UserSearch,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
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
  { href: "/ats/applicants", label: "Applicants", icon: UserSearch },
  { href: "/ats/calendar", label: "Interview calendar", icon: CalendarClock },
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
    children: [
      { href: "/ats/rbac", label: "Roles & permissions" },
      { href: "/ats/rbac/users/staff", label: "User accounts" },
    ],
  },
];

const SIDEBAR_COLLAPSED_KEY = "ats:sidebar-collapsed";

/** Persists to localStorage; starts expanded and syncs after mount to avoid
 * an SSR/client hydration mismatch. */
function useCollapsedSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    // Deliberately set on mount, after the SSR-matching first paint, to read
    // localStorage without causing a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCollapsed(localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1");
  }, []);

  const toggle = () =>
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? "1" : "0");
      return next;
    });

  return [collapsed, toggle] as const;
}

const linkClass = (active: boolean, collapsed?: boolean) =>
  cn(
    "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
    collapsed && "justify-center px-0",
    active
      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
      : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50",
  );

function NavGroup({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const pathname = usePathname();
  const groupActive = pathname.startsWith(item.href);
  const [open, setOpen] = useState(groupActive);

  if (collapsed) {
    return (
      <Link
        href={item.href}
        title={item.label}
        className={linkClass(groupActive, true)}
      >
        <item.icon className="size-4" />
      </Link>
    );
  }

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
  const [collapsed, toggleCollapsed] = useCollapsedSidebar();

  return (
    <div data-surface="ats" className="flex min-h-screen">
      <aside
        className={cn(
          "bg-sidebar text-sidebar-foreground sticky top-0 hidden h-screen shrink-0 flex-col overflow-y-auto border-r transition-[width] duration-200 md:flex",
          collapsed ? "w-16" : "w-60",
        )}
      >
        <div
          className={cn(
            "flex h-14 items-center border-b",
            collapsed ? "justify-center px-2" : "justify-between px-4",
          )}
        >
          {collapsed ? (
            <Link href="/ats" title="ATS console">
              <span className="bg-primary text-primary-foreground grid size-7 place-items-center rounded-md text-sm font-bold">
                F
              </span>
            </Link>
          ) : (
            <Logo href="/ats" subtitle="ATS console" />
          )}
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {nav.map((item) => {
            if (item.adminOnly && role !== "admin") return null;
            if (item.children)
              return <NavGroup key={item.href} item={item} collapsed={collapsed} />;
            const active =
              item.href === "/ats"
                ? pathname === "/ats"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={linkClass(active, collapsed)}
              >
                <item.icon className="size-4" />
                {collapsed ? null : item.label}
              </Link>
            );
          })}
        </nav>
        <div className={cn("border-t p-3", collapsed && "flex justify-center")}>
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(linkClass(false, collapsed), "w-full")}
          >
            {collapsed ? (
              <PanelLeftOpen className="size-4" />
            ) : (
              <>
                <PanelLeftClose className="size-4" />
                Collapse
              </>
            )}
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-3 border-b px-4">
          <div className="md:hidden">
            <Logo href="/ats" />
          </div>
          <div className="ml-auto flex items-center gap-2">
            {role === "admin" ? (
              <Button asChild variant="ghost" size="sm">
                <Link href="/ats?view=overview#analytics">
                  <ChartNoAxesCombined /> Analytics
                </Link>
              </Button>
            ) : null}
            <ThemeToggle />
            <UserMenu homeHref="/ats" />
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
