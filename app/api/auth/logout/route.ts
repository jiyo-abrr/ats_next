import { type NextRequest, NextResponse } from "next/server";

import { API_URL, API_V1, REFRESH_COOKIE } from "@/lib/config";
import { clearAuthCookies } from "@/lib/auth/cookies";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const refresh = req.cookies.get(REFRESH_COOKIE)?.value;

  if (refresh) {
    // Best-effort denylist on the backend; ignore failures.
    await fetch(`${API_URL}${API_V1}/auth/logout`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ refresh_token: refresh }),
      cache: "no-store",
    }).catch(() => undefined);
  }

  const res = NextResponse.json({ ok: true });
  clearAuthCookies(res);
  return res;
}
