import "server-only";

import { cookies } from "next/headers";

import { ACCESS_COOKIE, API_URL, API_V1, REFRESH_COOKIE } from "@/lib/config";
import type { User } from "@/lib/types";
// (User is foundational — kept in lib/types so lib/ stays a leaf.)

/**
 * Server-side fetch against the FastAPI backend for use in Server Components
 * (e.g. the ATS layout role guard).
 *
 * Server Components cannot write cookies, so a token refresh performed here is
 * in-memory only — it unblocks the current render, and the client's first RTK
 * Query call through the BFF (`/api/bff/**`) will perform and persist the real
 * refresh. Route guards are read-only, so that is sufficient.
 */
export async function serverApi<T>(
  path: string,
  init?: RequestInit,
): Promise<{ ok: true; data: T } | { ok: false; status: number }> {
  const store = await cookies();
  const access = store.get(ACCESS_COOKIE)?.value;
  const refresh = store.get(REFRESH_COOKIE)?.value;

  const call = (token: string | undefined) =>
    fetch(`${API_URL}${API_V1}${path}`, {
      ...init,
      headers: {
        accept: "application/json",
        ...(init?.headers ?? {}),
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      cache: "no-store",
    });

  let res = await call(access);

  if (res.status === 401 && refresh) {
    const refreshed = await fetch(`${API_URL}${API_V1}/auth/refresh`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ refresh_token: refresh }),
      cache: "no-store",
    });
    if (refreshed.ok) {
      const { access_token } = (await refreshed.json()) as {
        access_token: string;
      };
      res = await call(access_token);
    }
  }

  if (!res.ok) return { ok: false, status: res.status };
  return { ok: true, data: (await res.json()) as T };
}

/** Current user for a Server Component, or `null` if unauthenticated. */
export async function getServerUser(): Promise<User | null> {
  const result = await serverApi<User>("/auth/me");
  return result.ok ? result.data : null;
}
