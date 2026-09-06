import { type NextRequest, NextResponse } from "next/server";

import { REFRESH_COOKIE } from "@/lib/config";

/**
 * Optimistic auth gate (Next 16 "proxy", formerly middleware).
 *
 * This only checks for the *presence* of the refresh cookie — it does not verify
 * the JWT. Real authorization (and the hr/admin role check) happens in the ATS
 * layout Server Component and in the FastAPI backend. See
 * docs: app/guides/authentication#optimistic-checks.
 */
export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has(REFRESH_COOKIE);
  if (hasSession) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set(
    "next",
    request.nextUrl.pathname + request.nextUrl.search,
  );
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/ats/:path*", "/applications/:path*", "/profile"],
};
