import { type NextRequest, NextResponse } from "next/server";

import { API_URL, API_V1 } from "@/lib/config";
import { setAuthCookies } from "@/lib/auth/cookies";
import { loginSchema } from "@/features/auth/schema";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const parsed = loginSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ detail: "Invalid request" }, { status: 400 });
  }

  const loginRes = await fetch(`${API_URL}${API_V1}/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(parsed.data),
    cache: "no-store",
  });

  const loginBody = await loginRes.json().catch(() => ({}));
  if (!loginRes.ok) {
    return NextResponse.json(
      { detail: loginBody.detail ?? "Login failed" },
      { status: loginRes.status },
    );
  }

  const { access_token, refresh_token } = loginBody as {
    access_token: string;
    refresh_token: string;
  };

  const meRes = await fetch(`${API_URL}${API_V1}/auth/me`, {
    headers: { authorization: `Bearer ${access_token}` },
    cache: "no-store",
  });
  if (!meRes.ok) {
    return NextResponse.json(
      { detail: "Could not load profile" },
      { status: 502 },
    );
  }

  const res = NextResponse.json({ user: await meRes.json() });
  setAuthCookies(res, { access_token, refresh_token });
  return res;
}
