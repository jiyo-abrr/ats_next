import type { Middleware } from "@reduxjs/toolkit";

import { toast } from "@/lib/utils/toast";

/**
 * Surfaces a toast for any rejected thunk — the single place mutation failures
 * become user-visible (replaces RTK Query's `baseQueryWithFeedback`).
 * Opt out per-call by passing `{ silent: true }` in the thunk arg object.
 */
export const toastErrorMiddleware: Middleware = () => (next) => (action) => {
  const a = action as {
    type?: string;
    error?: { message?: string };
    meta?: { arg?: { silent?: boolean } };
  };
  if (
    typeof a.type === "string" &&
    a.type.endsWith("/rejected") &&
    !a.meta?.arg?.silent
  ) {
    toast.error(a.error?.message ?? "Something went wrong");
  }
  return next(action);
};
