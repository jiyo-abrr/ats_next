import { type NextRequest, NextResponse } from "next/server";

import { API_URL, API_V1 } from "@/lib/config";
import { setAuthCookies } from "@/lib/auth/cookies";

export const runtime = "nodejs";

/**
 * Applicant self-signup. The FastAPI endpoint is `multipart/form-data`
 * (name fields + a `resume` file) and returns tokens + user, so we forward the
 * incoming FormData verbatim and persist the returned tokens as cookies.
 */
export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json(
      { detail: "Expected multipart/form-data" },
      { status: 400 },
    );
  }

  const upstream = await fetch(`${API_URL}${API_V1}/auth/signup`, {
    method: "POST",
    headers: { "content-type": contentType },
    body: await req.arrayBuffer(),
    cache: "no-store",
  });

  const body = await upstream.json().catch(() => ({}));
  if (!upstream.ok) {
    return NextResponse.json(
      { detail: body.detail ?? "Sign up failed" },
      { status: upstream.status },
    );
  }

  const { access_token, refresh_token, user } = body as {
    access_token: string;
    refresh_token: string;
    user: unknown;
  };

  const res = NextResponse.json({ user });
  setAuthCookies(res, { access_token, refresh_token });
  return res;
}
