import { toast as sonner } from "sonner";

/** Thin wrapper so call sites don't import sonner directly. */
export const toast = {
  success: (message: string, description?: string) =>
    sonner.success(message, { description }),
  error: (message: string, description?: string) =>
    sonner.error(message, { description }),
  info: (message: string, description?: string) =>
    sonner.info(message, { description }),
  warning: (message: string, description?: string) =>
    sonner.warning(message, { description }),
  promise: sonner.promise,
};
