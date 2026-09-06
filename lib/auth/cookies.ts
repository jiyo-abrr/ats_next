import "server-only";

import type { NextResponse } from "next/server";

import {
  ACCESS_COOKIE,
  ACCESS_MAX_AGE,
  REFRESH_COOKIE,
  REFRESH_MAX_AGE,
} from "@/lib/config";

const isProd = process.env.NODE_ENV === "production";

function baseOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: isProd,
    path: "/",
  };
}

/** Write both auth cookies onto an outgoing Route Handler response. */
export function setAuthCookies(
  res: NextResponse,
  tokens: { access_token: string; refresh_token?: string },
) {
  res.cookies.set(ACCESS_COOKIE, tokens.access_token, {
    ...baseOptions(),
    maxAge: ACCESS_MAX_AGE,
  });
  if (tokens.refresh_token) {
    res.cookies.set(REFRESH_COOKIE, tokens.refresh_token, {
      ...baseOptions(),
      maxAge: REFRESH_MAX_AGE,
    });
  }
}

/** Refresh just the access cookie (used after a silent token refresh). */
export function setAccessCookie(res: NextResponse, accessToken: string) {
  res.cookies.set(ACCESS_COOKIE, accessToken, {
    ...baseOptions(),
    maxAge: ACCESS_MAX_AGE,
  });
}

/** Expire both auth cookies. */
export function clearAuthCookies(res: NextResponse) {
  for (const name of [ACCESS_COOKIE, REFRESH_COOKIE]) {
    res.cookies.set(name, "", { ...baseOptions(), maxAge: 0 });
  }
}
