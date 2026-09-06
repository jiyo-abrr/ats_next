import { apiClient } from "@/lib/api/client";
import type { LoginInput, User } from "@/features/auth/schema";

/**
 * Auth hits the Next route handlers at `/api/auth/*` (which manage the httpOnly
 * cookies), not the BFF passthrough — so these use `fetch` directly. `getMe`
 * goes through the BFF like every other read.
 */

async function authFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const isForm = init?.body instanceof FormData;
  const res = await fetch(`/api/auth/${path}`, {
    credentials: "include",
    ...init,
    headers: {
      accept: "application/json",
      ...(isForm ? {} : { "content-type": "application/json" }),
      ...(init?.headers ?? {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.detail ?? `Request failed (${res.status})`);
  }
  return body as T;
}

export const getMe = () => apiClient<User>("auth/me");

export const login = (body: LoginInput) =>
  authFetch<{ user: User }>("login", {
    method: "POST",
    body: JSON.stringify(body),
  });

/** `form` is the assembled multipart FormData (fields + resume file). */
export const signup = (form: FormData) =>
  authFetch<{ user: User }>("signup", { method: "POST", body: form });

export const logout = () =>
  authFetch<{ ok: true }>("logout", { method: "POST" });

export const createHrAccount = (body: Record<string, unknown>) =>
  apiClient<User>("auth/hr-accounts", {
    method: "POST",
    body: JSON.stringify(body),
  });
