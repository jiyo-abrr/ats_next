"use client";

import { useAppSelector } from "@/lib/hooks/redux";
import { ATS_ROLES } from "@/lib/config";

export const useCurrentUser = () => useAppSelector((s) => s.auth.user);
export const useAuthResolved = () => useAppSelector((s) => s.auth.resolved);
export const useAuthError = () => useAppSelector((s) => s.auth.error);
export const useAuthLoading = () => useAppSelector((s) => s.auth.loading);

export const useIsStaff = () => {
  const user = useCurrentUser();
  return user ? (ATS_ROLES as readonly string[]).includes(user.role) : false;
};
