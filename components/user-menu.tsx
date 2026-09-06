"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, User as UserIcon } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/store/authSlice";
import { useCurrentUser } from "@/features/auth/hooks";
import { ROLE_LABELS } from "@/lib/constants";
import { useAppDispatch } from "@/lib/hooks/redux";
import { toast } from "@/lib/utils/toast";

export function UserMenu({ homeHref = "/" }: { homeHref?: string }) {
  const user = useCurrentUser();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  if (!user) return null;

  const initials =
    `${user.first_name[0] ?? ""}${user.last_name[0] ?? ""}`.toUpperCase();

  const onLogout = async () => {
    setBusy(true);
    await dispatch(logout()).unwrap().catch(() => undefined);
    toast.success("Signed out");
    router.push(homeHref);
    router.refresh();
    setBusy(false);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 px-1.5">
          <Avatar className="size-6">
            <AvatarFallback className="text-[11px]">{initials}</AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline">{user.first_name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col">
          <span>
            {user.first_name} {user.last_name}
          </span>
          <span className="text-muted-foreground text-xs font-normal">
            {user.email} · {ROLE_LABELS[user.role]}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {user.role === "applicant" ? (
          <DropdownMenuItem asChild>
            <Link href="/profile">
              <UserIcon /> Profile
            </Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem disabled={busy} onSelect={onLogout}>
          <LogOut /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
