import { type NextRequest, NextResponse } from "next/server";

import { ACCESS_COOKIE, API_URL, API_V1, REFRESH_COOKIE } from "@/lib/config";
import { clearAuthCookies, setAccessCookie } from "@/lib/auth/cookies";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Headers we never forward upstream (hop-by-hop / host-specific). */
const STRIP_REQUEST_HEADERS = new Set([
  "host",
  "connection",
  "content-length",
  "cookie",
  "authorization",
]);

const STRIP_RESPONSE_HEADERS = new Set([
  "content-encoding",
  "content-length",
  "transfer-encoding",
  "connection",
]);

type Ctx = { params: Promise<{ path: string[] }> };

async function handle(req: NextRequest, ctx: Ctx): Promise<NextResponse> {
  const { path } = await ctx.params;
  const search = req.nextUrl.search;
  const target = `${API_URL}${API_V1}/${path.join("/")}${search}`;

  const method = req.method;
  const hasBody = method !== "GET" && method !== "HEAD";
  const bodyBuffer = hasBody ? await req.arrayBuffer() : undefined;

  const baseHeaders = new Headers();
  req.headers.forEach((value, key) => {
    if (!STRIP_REQUEST_HEADERS.has(key.toLowerCase())) baseHeaders.set(key, value);
  });

  const access = req.cookies.get(ACCESS_COOKIE)?.value;
  const refresh = req.cookies.get(REFRESH_COOKIE)?.value;

  const doFetch = (token: string | undefined) => {
    const headers = new Headers(baseHeaders);
    if (token) headers.set("authorization", `Bearer ${token}`);
    return fetch(target, {
      method,
      headers,
      body: bodyBuffer,
      redirect: "manual",
      cache: "no-store",
    });
  };

  let upstream = await doFetch(access);
  let refreshedAccess: string | null = null;

  if (upstream.status === 401 && refresh) {
    const refreshRes = await fetch(`${API_URL}${API_V1}/auth/refresh`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ refresh_token: refresh }),
      cache: "no-store",
    });

    if (refreshRes.ok) {
      refreshedAccess = (
        (await refreshRes.json()) as { access_token: string }
      ).access_token;
      upstream = await doFetch(refreshedAccess);
    } else {
      const dead = new NextResponse(
        JSON.stringify({ detail: "Session expired" }),
        { status: 401, headers: { "content-type": "application/json" } },
      );
      clearAuthCookies(dead);
      return dead;
    }
  }

  const responseHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    if (!STRIP_RESPONSE_HEADERS.has(key.toLowerCase())) {
      responseHeaders.set(key, value);
    }
  });

  const payload = await upstream.arrayBuffer();
  const res = new NextResponse(payload.byteLength ? payload : null, {
    status: upstream.status,
    headers: responseHeaders,
  });

  if (refreshedAccess) setAccessCookie(res, refreshedAccess);
  return res;
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
