/**
 * Central configuration constants shared across the BFF layer and the client.
 * Server-only values (API URL) are read from process.env at call sites in
 * server code — never import those into a Client Component.
 */

/** FastAPI base, e.g. `http://localhost:8000`. Server-side only. */
export const API_URL = process.env.ATS_API_URL ?? "http://localhost:8000";

/** Versioned API prefix on the FastAPI side. */
export const API_V1 = "/api/v1";

/** httpOnly cookie holding the short-lived access JWT. */
export const ACCESS_COOKIE = "ats_at";
/** httpOnly cookie holding the long-lived refresh JWT. */
export const REFRESH_COOKIE = "ats_rt";

/** Access token lifetime hint for the cookie (backend default is 30 min). */
export const ACCESS_MAX_AGE = 60 * 30;
/** Refresh token lifetime hint for the cookie (backend default is 7 days). */
export const REFRESH_MAX_AGE = 60 * 60 * 24 * 7;

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "FMC";

/** Roles that may access the ATS (fmc-ats) surface. */
export const ATS_ROLES = ["hr", "admin"] as const;
